import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api, { setAuthToken } from '../services/api';

const formatCurrency = (value) => `₹ ${Number(value).toLocaleString('en-IN')}`;

const PlanCard = ({ plan, onBuy }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let timer;
    if (success) {
      timer = setTimeout(() => setSuccess(false), 2200);
    }

    return () => clearTimeout(timer);
  }, [success]);

  useEffect(() => {
    if (!confirmOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [confirmOpen]);

  const handleInitiate = () => {
    setConfirmOpen(true);
  };

  const handleCancel = () => setConfirmOpen(false);

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      const token = window.localStorage.getItem('corona_token');
      if (token) {
        setAuthToken(token);
      }

      const res = await api.post('/transactions/purchase', { planId: plan._id });

      if (res.data && res.data.user) {
        const localUser = JSON.parse(window.localStorage.getItem('corona_user') || 'null') || {};
        const updated = { ...localUser, balance: res.data.user.balance };
        window.localStorage.setItem('corona_user', JSON.stringify(updated));
      }

      setProcessing(false);
      setConfirmOpen(false);
      setSuccess(true);
      if (typeof onBuy === 'function') {
        onBuy(res.data.purchase || { planId: plan._id });
      }
    } catch (err) {
      setProcessing(false);
      setConfirmOpen(false);
      const msg = err?.response?.data?.message || 'Unable to complete purchase. Please try again.';
      setError(msg);
      setTimeout(() => setError(''), 2600);
    }
  };

  return (
    <>
      <article className="plan-card">
        <div className="plan-card__media" style={{ backgroundImage: `url(${plan.imageUrl})` }}>
          <span className="plan-card__badge">{plan.badgeLabel || plan.title}</span>
        </div>
        <div className="plan-card__details">
          <div className="plan-row">
            <span>Price</span>
            <strong>{formatCurrency(plan.price)}</strong>
          </div>
          <div className="plan-row">
            <span>Daily</span>
            <strong>{formatCurrency(plan.dailyEarning)}</strong>
          </div>
          <div className="plan-row">
            <span>Day</span>
            <strong>{plan.durationDays}</strong>
          </div>
          <div className="plan-row">
            <span>Total</span>
            <strong>{formatCurrency(plan.totalEarning)}</strong>
          </div>
        </div>
        {plan.active ? (
          <button className="plan-card__buy animate-flash" type="button" onClick={handleInitiate}>
            Buy now
          </button>
        ) : (
          <button className="plan-card__buy plan-card__buy--coming-soon" type="button" disabled>
            Coming soon
          </button>
        )}
      </article>

      {confirmOpen &&
        createPortal(
          <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={handleCancel}>
            <div className="welcome-modal purchase-modal" onClick={(event) => event.stopPropagation()}>
              <div className="plan-confirm__image" style={{ backgroundImage: `url(${plan.imageUrl})` }} />
              <h2>Confirm Purchase</h2>
              <div style={{ textAlign: 'left', margin: '10px 0 18px' }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>{plan.title}</div>
                <div style={{ color: '#5f5550' }}>
                  Price: <strong>{formatCurrency(plan.price)}</strong>
                </div>
                <div style={{ color: '#5f5550' }}>
                  Duration: <strong>{plan.durationDays} day(s)</strong>
                </div>
                <div style={{ color: '#5f5550' }}>
                  Total earning: <strong>{formatCurrency(plan.totalEarning)}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="secondary-button" type="button" onClick={handleCancel} disabled={processing}>
                  Cancel
                </button>
                <button className="primary-button" type="button" onClick={handleConfirm} disabled={processing}>
                  {processing ? 'Processing…' : 'Confirm & Buy'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {success &&
        createPortal(
          <div className="modal-backdrop" style={{ background: 'transparent', pointerEvents: 'none' }}>
            <div className="purchase-toast">Purchase successful</div>
          </div>,
          document.body
        )}

      {error &&
        createPortal(
          <div className="modal-backdrop" style={{ background: 'transparent', pointerEvents: 'none' }}>
            <div className="error-toast">{error}</div>
          </div>,
          document.body
        )}
    </>
  );
};

export default PlanCard;
