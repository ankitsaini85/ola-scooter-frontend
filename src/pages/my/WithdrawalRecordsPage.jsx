import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api, { setAuthToken } from '../../services/api';
import BottomNav from '../../components/BottomNav';

const WithdrawalRecordsPage = () => {
  const token = window.localStorage.getItem('corona_token');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    setAuthToken(token);

    const loadRecords = async () => {
      try {
        const response = await api.get('/transactions/withdrawals');
        setRecords(response.data?.withdrawals || []);
      } catch (_error) {
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [token]);

  const formatAmount = (value) => `₹ ${Number(value || 0).toLocaleString('en-IN')}`;

  const formatDate = (value) =>
    value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '-';

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="screen-shell">
      <header className="mobile-topbar">
        <Link to="/pages/index/my" className="mobile-topbar__back" aria-label="Back to my page">
          <span>‹</span>
        </Link>
        <h1>Withdrawal Records</h1>
      </header>

      <section className="page-card page-card--tight records-page">
        {loading ? (
          <div className="device-empty-state records-empty-state">Loading...</div>
        ) : records.length === 0 ? (
          <div className="device-empty-state records-empty-state">NO DATA</div>
        ) : (
          <div className="records-list">
            {records.map((record) => (
              <article key={record._id} className="record-card">
                <div className="record-card__header">
                  <strong>{formatAmount(record.amount)}</strong>
                  <span className={`record-card__status record-card__status--${record.status}`}>{record.status}</span>
                </div>
                <div className="record-card__meta">
                  <span>Account: {record.bankDetailsSnapshot?.accountNumber || '-'}</span>
                  <span>{record.bankDetailsSnapshot?.realName || '-'}</span>
                  <span>{formatDate(record.createdAt)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <BottomNav activeTab="my" />
    </main>
  );
};

export default WithdrawalRecordsPage;