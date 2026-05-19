import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import { loadCurrentUser, saveBankDetails } from '../../services/profile';

const BankCardPage = () => {
  const token = window.localStorage.getItem('corona_token');
  const [form, setForm] = useState({ realName: '', ifsc: '', accountNumber: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const user = await loadCurrentUser();
        setForm({
          realName: user.bankDetails?.realName || '',
          ifsc: user.bankDetails?.ifsc || '',
          accountNumber: user.bankDetails?.accountNumber || '',
        });
      } catch (_error) {
        setMessage('Unable to load bank details');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setSaving(true);

    try {
      await saveBankDetails(form);
      setMessage('Bank details updated');
    } catch (requestError) {
      setMessage(requestError?.response?.data?.message || 'Unable to update bank details');
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="screen-shell">
      <header className="mobile-topbar">
        <Link to="/home" className="mobile-topbar__back" aria-label="Back to home">
          <span>‹</span>
        </Link>
        <h1>Bind Bank Card</h1>
      </header>

      <section className="page-card page-card--tight page-card--centered">
        {loading ? (
          <div className="app-loading">Loading bank details...</div>
        ) : (
          <form className="stacked-form" onSubmit={handleSubmit}>
            <label>
              <span>Real Name</span>
              <input
                type="text"
                value={form.realName}
                onChange={(event) => setForm({ ...form, realName: event.target.value })}
                placeholder="Enter real name"
              />
            </label>
            <label>
              <span>IFSC</span>
              <input
                type="text"
                value={form.ifsc}
                onChange={(event) => setForm({ ...form, ifsc: event.target.value })}
                placeholder="Enter IFSC"
              />
            </label>
            <label>
              <span>Bank Account Number</span>
              <input
                type="text"
                value={form.accountNumber}
                onChange={(event) => setForm({ ...form, accountNumber: event.target.value })}
                placeholder="Enter Bank Account Number"
              />
            </label>
            {message ? <p className="form-feedback">{message}</p> : null}
            <button type="submit" className="recharge-submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save bank details'}
            </button>
          </form>
        )}
      </section>

      <BottomNav activeTab="my" />
    </main>
  );
};

export default BankCardPage;
