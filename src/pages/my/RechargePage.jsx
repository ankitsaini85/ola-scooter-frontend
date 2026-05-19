import React, { useMemo, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import api, { setAuthToken } from '../../services/api';
import { loadCurrentUser } from '../../services/profile';

const channels = [
  { id: 'l', name: 'Pay - L' },
  { id: 't', name: 'Pay - T' },
  { id: 'h', name: 'Pay - H' },
];

const getPaymentUrl = (payload) => {
  const candidates = [
    payload?.redirectUrl,
    payload?.payInfo,
    payload?.payInfo?.url,
    payload?.payUrl,
    payload?.url,
    payload?.raw?.payInfo,
    payload?.raw?.payInfo?.url,
    payload?.raw?.url,
    payload?.raw?.payUrl,
    payload?.raw?.data?.pay_url,
    payload?.raw?.data?.url,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && /^https?:\/\//i.test(candidate.trim())) {
      return candidate.trim();
    }
  }

  return null;
};

const RechargePage = () => {
  const [amount, setAmount] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('t');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = window.localStorage.getItem('corona_token');
  if (token) setAuthToken(token);

  const payLabel = useMemo(() => {
    const numericAmount = amount ? Number(amount).toLocaleString('en-IN') : '0';
    return `Pay ${numericAmount}`;
  }, [amount]);

  return (
    <main className="screen-shell">
      <header className="mobile-topbar">
        <Link to="/home" className="mobile-topbar__back" aria-label="Back to home">
          <span>‹</span>
        </Link>
        <h1>Recharge</h1>
      </header>

      <section className="page-card page-card--tight">
        <div className="page-section">
          <h2>Balance Recharge</h2>
          <p>Please enter the recharge amount</p>
        </div>

        <div className="recharge-amount">
          <label htmlFor="recharge-amount">Amount</label>
          <input id="recharge-amount" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount" />
        </div>

        <div className="page-section">
          <p>Please select the recharge channel</p>
          <div className="recharge-list">
            {channels.map((channel) => (
              <button
                key={channel.id}
                type="button"
                className={`recharge-item ${selectedChannel === channel.id ? 'is-active' : ''}`}
                onClick={() => setSelectedChannel(channel.id)}
              >
                <span className="recharge-item__badge">{selectedChannel === channel.id ? 'Select' : ''}</span>
                <span className="recharge-item__name">{channel.name}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="recharge-submit"
            onClick={async () => {
              if (!amount || Number(amount) <= 0) return alert('Please enter a valid amount');
              setLoading(true);
              let popup = null;
              let polling = null;
              try {
                // open a placeholder popup synchronously to avoid popup blockers
                popup = window.open('', '_blank', 'width=520,height=720');
                if (popup) {
                  try {
                    popup.document.body.innerText = 'Opening payment...';
                  } catch (e) {
                    // cross-origin or not ready, ignore
                  }
                }

                const res = await api.post('/payment/watchpay/create', { amount: Number(amount), amountNeeded: Number(amount) });
                const data = res.data || {};
                console.debug('payment create response', data);
                const orderId = data.orderId || (data.order && data.order._id) || null;

                // open gateway UI: prefer explicit redirectUrl, then html, then common url fields
                try {
                  const paymentUrl = getPaymentUrl(data);
                  if (paymentUrl) {
                    if (popup) popup.location.href = paymentUrl; else popup = window.open(paymentUrl, '_blank', 'width=520,height=720');
                  } else if (data.html) {
                    if (!popup) popup = window.open('', '_blank', 'width=520,height=720');
                    popup.document.open();
                    popup.document.write(data.html);
                    popup.document.close();
                  } else {
                    if (!popup) popup = window.open('', '_blank', 'width=520,height=720');
                    try { popup.document.body.innerText = 'Please complete the payment in the opened tab.'; } catch (e) {}
                    console.debug('No payment URL found in create response', data);
                  }
                } catch (writeErr) {
                  console.error('Failed to open gateway UI', writeErr, data);
                  alert('Failed to open payment window. Please check your popup blocker and try again.');
                }

                // Poll order status
                if (!orderId) {
                  console.debug('No orderId returned from create; navigating to records');
                  setTimeout(() => navigate('/pages/my/rechargelist'), 2000);
                } else {
                  polling = setInterval(async () => {
                    try {
                      if (popup && popup.closed) {
                        console.warn('Payment popup was closed by user while waiting for status');
                        clearInterval(polling);
                        return;
                      }
                      const s = await api.get(`/payment/watchpay/status/${orderId}`, {
                        params: { t: Date.now() },
                        headers: {
                          'Cache-Control': 'no-cache',
                          Pragma: 'no-cache',
                        },
                      });
                      if (s.data && s.data.status === 'PAID') {
                        clearInterval(polling);
                        console.debug('Order paid, refreshing user');
                        try { await loadCurrentUser(); } catch (e) { console.error('Failed to reload user', e); }
                        try { if (popup && !popup.closed) popup.close(); } catch (e) {}
                        navigate('/pages/my/rechargelist');
                      }
                    } catch (e) {
                      console.error('Error polling payment status', e);
                      // don't spam errors; keep trying
                    }
                  }, 2000);
                }
              } catch (err) {
                console.error('Payment initialization error', err);
                alert(err?.response?.data?.message || err.message || 'Unable to start payment');
                try { if (popup && !popup.closed) popup.close(); } catch (e) {}
                if (polling) clearInterval(polling);
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? 'Processing…' : payLabel}
          </button>
        </div>

        <div className="notice-stack">
          <div className="notice-box">Minimum top-up: 580Rs.</div>
          <div className="notice-box">Please pay and submit UTR within the stipulated time.</div>
          <div className="notice-box">Do not save old account top-ups.</div>
        </div>
      </section>

      <BottomNav activeTab="home" />
    </main>
  );
};

export default RechargePage;
