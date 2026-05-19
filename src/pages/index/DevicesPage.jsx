import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import api, { setAuthToken } from '../../services/api';

const DevicesPage = ({ activeTab = 'devices' }) => {
  const [selectedTab, setSelectedTab] = useState('my');
  const [loading, setLoading] = useState(true);
  const [incomeStat, setIncomeStat] = useState(0);
  const [records, setRecords] = useState({ myIncomeRecords: [], subordinateIncomeRecords: [] });

  useEffect(() => {
    const token = window.localStorage.getItem('corona_token');
    if (!token) {
      setLoading(false);
      return;
    }

    setAuthToken(token);

    const loadIncomeDetails = async () => {
      try {
        const response = await api.get('/transactions/income-details');
        setIncomeStat(Number(response.data?.incomeStat || 0));
        setRecords({
          myIncomeRecords: response.data?.myIncomeRecords || [],
          subordinateIncomeRecords: response.data?.subordinateIncomeRecords || [],
        });
      } catch (_error) {
        setRecords({ myIncomeRecords: [], subordinateIncomeRecords: [] });
      } finally {
        setLoading(false);
      }
    };

    loadIncomeDetails();
  }, []);

  const formatAmount = (value) => `₹ ${Number(value || 0).toLocaleString('en-IN')}`;
  const formatDate = (value) =>
    value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '-';

  return (
    <main className="screen-shell">
      <header className="mobile-topbar">
        <Link to="/home" className="mobile-topbar__back" aria-label="Back to home">
          <span>‹</span>
        </Link>
        <h1>Balance Details</h1>
      </header>

      <section className="page-card page-card--tight balance-page">
        <div className="balance-card">
          <p className="balance-card__label">Income Stat</p>
          <div className="balance-card__amount">{formatAmount(incomeStat)}</div>
        </div>

        <div className="segment-tabs balance-tabs">
          <button className={selectedTab === 'my' ? 'is-active' : ''} type="button" onClick={() => setSelectedTab('my')}>
            My Income
          </button>
          <button
            className={selectedTab === 'subordinate' ? 'is-active' : ''}
            type="button"
            onClick={() => setSelectedTab('subordinate')}
          >
            Subordinate Income
          </button>
        </div>

        <div className="balance-panel">
          {selectedTab === 'my' ? (
            loading ? (
              <div className="device-empty-state">Loading...</div>
            ) : records.myIncomeRecords.length ? (
              <div className="records-list balance-records">
                {records.myIncomeRecords.map((record) => (
                  <article key={record._id} className="record-card">
                    <div className="record-card__header">
                      <strong>{formatAmount(record.amount)}</strong>
                      <span className="record-card__status">Plan income</span>
                    </div>
                    <div className="record-card__meta">
                      <span>{record?.meta?.planTitle || 'Plan income'}</span>
                      <span>{formatDate(record.createdAt)}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="device-empty-state">NO DATA</div>
            )
          ) : (
            loading ? (
              <div className="device-empty-state">Loading...</div>
            ) : records.subordinateIncomeRecords.length ? (
              <div className="records-list balance-records">
                {records.subordinateIncomeRecords.map((record) => (
                  <article key={record._id} className="record-card">
                    <div className="record-card__header">
                      <strong>{formatAmount(record.amount)}</strong>
                      <span className="record-card__status">Level {record.level || '-'}</span>
                    </div>
                    <div className="record-card__meta">
                      <span>From: {record?.sourceUser?.phone || record?.meta?.sourcePhone || '-'}</span>
                      <span>{formatDate(record.createdAt)}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="device-empty-state">NO DATA</div>
            )
          )}
        </div>
      </section>

      <BottomNav activeTab={activeTab} />
    </main>
  );
};

export default DevicesPage;
