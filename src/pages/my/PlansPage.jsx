import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api, { setAuthToken } from '../../services/api';
import BottomNav from '../../components/BottomNav';

const PlansPage = () => {
  const token = window.localStorage.getItem('corona_token');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState('');

  useEffect(() => {
    if (!token) return;

    setAuthToken(token);

    const loadPlans = async () => {
      try {
        const response = await api.get('/transactions/purchases');
        setPlans(response.data?.purchases || []);
      } catch (_error) {
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [token]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  const formatAmount = (value) => `₹ ${Number(value || 0).toLocaleString('en-IN')}`;
  const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '-');

  return (
    <main className="screen-shell">
      <header className="mobile-topbar">
        <Link to="/pages/index/my" className="mobile-topbar__back" aria-label="Back to my page">
          <span>‹</span>
        </Link>
        <h1>My Plans</h1>
      </header>

      <section className="page-card page-card--tight records-page">
        {loading ? (
          <div className="device-empty-state records-empty-state">Loading...</div>
        ) : plans.length === 0 ? (
          <div className="device-empty-state records-empty-state">NO DATA</div>
        ) : (
          <div className="plans-list">
            {plans.map((plan) => {
              const isExpanded = expandedId === String(plan._id);
              const planStatus = plan.active ? 'active' : 'expired';

              return (
                <article key={plan._id} className={`plan-history-card ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}>
                  <button
                    type="button"
                    className="plan-history-card__head"
                    onClick={() => setExpandedId(isExpanded ? '' : String(plan._id))}
                  >
                    <div>
                      <h3>{plan.planTitle || plan.plan?.title || 'Plan'}</h3>
                      <p>{formatDate(plan.createdAt)}</p>
                    </div>
                    <div className="plan-history-card__status-wrap">
                      <strong>{formatAmount(plan.dailyEarning)}</strong>
                      <span className={`plan-history-card__status plan-history-card__status--${planStatus}`}>{planStatus}</span>
                    </div>
                  </button>

                  {isExpanded ? (
                    <div className="plan-history-card__body">
                      <div className="plan-history-grid">
                        <div>
                          <span>Price</span>
                          <strong>{formatAmount(plan.price)}</strong>
                        </div>
                        <div>
                          <span>Daily income</span>
                          <strong>{formatAmount(plan.dailyEarning)}</strong>
                        </div>
                        <div>
                          <span>Duration</span>
                          <strong>{plan.durationDays} days</strong>
                        </div>
                        <div>
                          <span>Credited days</span>
                          <strong>{plan.creditedDays || 0}</strong>
                        </div>
                        <div>
                          <span>Start date</span>
                          <strong>{formatDate(plan.startsAt)}</strong>
                        </div>
                        <div>
                          <span>Expiry date</span>
                          <strong>{formatDate(plan.expiresAt)}</strong>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <BottomNav activeTab="my" />
    </main>
  );
};

export default PlansPage;
