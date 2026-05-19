import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api, { setAuthToken } from '../services/api';
import {
  listAdminWithdrawalRequests,
  setWithdrawalRequestStatus,
  getAdminConfig,
  updateAdminConfig,
  listAdminUserPlans,
  deleteAdminUserPlan,
} from '../services/profile';

const emptyPlan = {
  title: '',
  category: 'day',
  imageUrl: '',
  price: '',
  dailyEarning: '',
  durationDays: '',
  totalEarning: '',
  badgeLabel: '',
  order: 0,
  active: true,
};

const menuItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'add-plan', label: 'Add plan' },
  { key: 'all-plans', label: 'All plans' },
  { key: 'day', label: 'Day income' },
  { key: 'vip', label: 'VIP plan' },
  { key: 'withdrawals', label: 'Withdrawal requests' },
  { key: 'user-plans', label: 'User plans' },
  { key: 'limits', label: 'Site limits' },
];

const AdminPage = () => {
  const adminToken = window.localStorage.getItem('corona_admin_token');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(emptyPlan);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(Boolean(adminToken));
  const [activeSection, setActiveSection] = useState('dashboard');
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalFilter, setWithdrawalFilter] = useState('pending');
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [processingWithdrawalId, setProcessingWithdrawalId] = useState('');
  const [expandedWithdrawalId, setExpandedWithdrawalId] = useState(null);
  const [adminConfig, setAdminConfig] = useState({ minRecharge: '', minWithdrawal: '' });
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState('');
  const [userPlans, setUserPlans] = useState([]);
  const [userPlansLoading, setUserPlansLoading] = useState(false);
  const [expandedUserPlanId, setExpandedUserPlanId] = useState('');
  const [deletingUserPlanId, setDeletingUserPlanId] = useState('');

  useEffect(() => {
    if (!adminToken) {
      return undefined;
    }

    setAuthToken(adminToken);

    const loadPlans = async () => {
      try {
        const response = await api.get('/admin/plans');
        setPlans(response.data.plans || []);
        try {
          const cfg = await getAdminConfig();
          setAdminConfig({
            minRecharge: cfg?.minRecharge ?? '',
            minWithdrawal: cfg?.minWithdrawal ?? '',
          });
        } catch (_err) {
          // ignore
        }
      } catch (_error) {
        window.localStorage.removeItem('corona_admin_token');
        setAuthToken(null);
        setReady(false);
      }
    };

    loadPlans();
  }, [adminToken]);

  useEffect(() => {
    if (!adminToken || activeSection !== 'withdrawals') {
      return undefined;
    }

    const loadWithdrawals = async () => {
      setWithdrawalLoading(true);
      setError('');

      try {
        const response = await listAdminWithdrawalRequests();
        setWithdrawals(response || []);
      } catch (requestError) {
        setError(requestError?.response?.data?.message || 'Unable to load withdrawal requests');
      } finally {
        setWithdrawalLoading(false);
      }
    };

    loadWithdrawals();
  }, [adminToken, activeSection]);

  useEffect(() => {
    if (!adminToken || activeSection !== 'user-plans') {
      return undefined;
    }

    const loadUserPlans = async () => {
      setUserPlansLoading(true);
      setError('');
      try {
        const response = await listAdminUserPlans();
        setUserPlans(response || []);
      } catch (requestError) {
        setError(requestError?.response?.data?.message || 'Unable to load user plans');
      } finally {
        setUserPlansLoading(false);
      }
    };

    loadUserPlans();
  }, [adminToken, activeSection]);

  const stats = useMemo(() => {
    const dayPlans = plans.filter((plan) => plan.category === 'day');
    const vipPlans = plans.filter((plan) => plan.category === 'vip');

    return {
      total: plans.length,
      day: dayPlans.length,
      vip: vipPlans.length,
    };
  }, [plans]);

  useEffect(() => {
    if (selectedImage) {
      const previewUrl = URL.createObjectURL(selectedImage);
      setImagePreview(previewUrl);

      return () => URL.revokeObjectURL(previewUrl);
    }

    setImagePreview(form.imageUrl || '');
    return undefined;
  }, [selectedImage, form.imageUrl]);

  if (!adminToken && ready) {
    return <Navigate to="/" replace />;
  }

  const reloadPlans = async () => {
    const response = await api.get('/admin/plans');
    setPlans(response.data.plans || []);
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/admin-login', loginForm);
      window.localStorage.setItem('corona_admin_token', response.data.token);
      setAuthToken(response.data.token);
      setReady(true);
      setActiveSection('dashboard');
      await reloadPlans();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  const savePlan = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const payload = new FormData();
    payload.append('title', form.title);
    payload.append('category', form.category);
    payload.append('price', String(Number(form.price)));
    payload.append('dailyEarning', String(Number(form.dailyEarning)));
    payload.append('durationDays', String(Number(form.durationDays)));
    payload.append('totalEarning', String(Number(form.totalEarning)));
    payload.append('badgeLabel', form.badgeLabel);
    payload.append('order', String(Number(form.order)));
    payload.append('active', String(form.active));

    if (selectedImage) {
      payload.append('image', selectedImage);
    } else if (form.imageUrl) {
      payload.append('imageUrl', form.imageUrl);
    }

    try {
      if (editingId) {
        await api.patch(`/admin/plans/${editingId}`, payload);
      } else {
        await api.post('/admin/plans', payload);
      }

      await reloadPlans();
      setForm(emptyPlan);
      setSelectedImage(null);
      setEditingId('');
      setActiveSection(form.category === 'vip' ? 'vip' : 'day');
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to save plan');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan) => {
    setEditingId(plan._id);
    setForm({
      title: plan.title,
      category: plan.category,
      imageUrl: plan.imageUrl,
      price: plan.price,
      dailyEarning: plan.dailyEarning,
      durationDays: plan.durationDays,
      totalEarning: plan.totalEarning,
      badgeLabel: plan.badgeLabel,
      order: plan.order,
      active: plan.active,
    });
    setSelectedImage(null);
    setActiveSection('add-plan');
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this plan?');
    if (!confirmed) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/admin/plans/${id}`);
      await reloadPlans();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem('corona_admin_token');
    setAuthToken(null);
    window.location.reload();
  };

  const saveAdminConfig = async (event) => {
    event.preventDefault();
    setSavingConfig(true);
    setError('');
    setConfigSuccess('');

    try {
      const payload = {
        minRecharge: Number(adminConfig.minRecharge),
        minWithdrawal: Number(adminConfig.minWithdrawal),
      };

      await updateAdminConfig(payload);
      setConfigSuccess('Limits updated successfully');
      setTimeout(() => setConfigSuccess(''), 4000);
      // refresh withdrawals or other dependent data if needed
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to update config');
    } finally {
      setSavingConfig(false);
    }
  };

  const visiblePlans =
    activeSection === 'day' || activeSection === 'vip'
      ? plans.filter((plan) => plan.category === activeSection)
      : plans;

  const dashboardCards = [
    { label: 'Total plans', value: stats.total },
    { label: 'Day income', value: stats.day },
    { label: 'VIP plans', value: stats.vip },
  ];

  const filteredWithdrawals =
    withdrawalFilter === 'all'
      ? withdrawals
      : withdrawals.filter((withdrawal) => withdrawal.status === withdrawalFilter);

  const formatAmount = (value) => `₹ ${Number(value || 0).toLocaleString('en-IN')}`;

  const formatDate = (value) =>
    value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '-';

  const handleWithdrawalAction = async (id, status) => {
    setProcessingWithdrawalId(id);
    setError('');

    try {
      await setWithdrawalRequestStatus(id, { status });
      const response = await listAdminWithdrawalRequests();
      setWithdrawals(response || []);
    } catch (requestError) {
      // Prefer server message, fall back to axios error message, then stringify for debugging
      const serverMsg = requestError?.response?.data?.message;
      const axiosMsg = requestError?.message;
      const raw = requestError?.response?.data || (requestError?.toString && requestError.toString());
      const composed = serverMsg || axiosMsg || 'Unable to update withdrawal request';
      setError(composed);
      // attach raw details for debugging in console
      // eslint-disable-next-line no-console
      console.error('Withdrawal update error', { id, status, serverData: raw, requestError });
    } finally {
      setProcessingWithdrawalId('');
    }
  };

  const handleDeleteUserPlan = async (id) => {
    const confirmed = window.confirm('Delete this user plan record?');
    if (!confirmed) {
      return;
    }

    setDeletingUserPlanId(id);
    setError('');

    try {
      await deleteAdminUserPlan(id);
      const next = await listAdminUserPlans();
      setUserPlans(next || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to delete user plan');
    } finally {
      setDeletingUserPlanId('');
    }
  };

  if (!adminToken && !ready) {
    return (
      <main className="admin-screen admin-screen--login">
        <section className="admin-login-card">
          <p className="eyebrow">Admin access</p>
          <h1>Sign in to manage plans</h1>
          <form className="auth-form" onSubmit={handleAdminLogin}>
            <label>
              Email
              <input
                type="email"
                value={loginForm.email}
                onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                placeholder="Admin email"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                placeholder="Admin password"
                required
              />
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Login as admin'}
            </button>
          </form>
          <Link className="auth-hero__admin-link" to="/">
            Back to app
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-screen">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <p className="eyebrow">OLA-EV scooter Admin</p>
          <h1>Control panel</h1>
          <p>Manage day income and VIP plans from one place.</p>
        </div>

        <nav className="admin-menu">
          {menuItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={activeSection === item.key ? 'is-active' : ''}
              onClick={() => {
                setActiveSection(item.key);
                if (item.key === 'add-plan' && !editingId) {
                  setForm((current) => ({ ...current, category: current.category || 'day' }));
                }
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <button className="secondary-button" type="button" onClick={handleLogout}>
            Logout
          </button>
          <Link className="auth-hero__admin-link" to="/">
            Back to app
          </Link>
        </div>
      </aside>

      <section className="admin-content">
        <header className="admin-header admin-header--stacked">
          <div>
            <p className="eyebrow">{activeSection === 'dashboard' ? 'Overview' : activeSection.replace('-', ' ')}</p>
            <h1>
              {activeSection === 'dashboard'
                ? 'Dashboard overview'
                : activeSection === 'add-plan'
                  ? editingId
                    ? 'Edit plan'
                    : 'Add new plan'
                  : activeSection === 'day'
                    ? 'Day income plans'
                    : activeSection === 'vip'
                        ? 'VIP plans'
                        : activeSection === 'user-plans'
                          ? 'User plans'
                          : 'All plans'}
            </h1>
          </div>
          {activeSection !== 'add-plan' ? (
            <button className="primary-button admin-header__cta" type="button" onClick={() => setActiveSection('add-plan')}>
              Add plan
            </button>
          ) : null}
        </header>

        {activeSection === 'dashboard' ? (
          <div className="admin-dashboard">
            <div className="admin-stats-grid">
              {dashboardCards.map((card) => (
                <article key={card.label} className="admin-stat-card">
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                </article>
              ))}
            </div>

            <div className="admin-panel">
              <div className="admin-panel__header">
                <h2>Quick actions</h2>
                <p>Choose a section from the menu to manage plans by category.</p>
              </div>
              <div className="admin-quick-actions">
                <button type="button" onClick={() => setActiveSection('add-plan')}>Create plan</button>
                <button type="button" onClick={() => setActiveSection('day')}>View day income</button>
                <button type="button" onClick={() => setActiveSection('vip')}>View VIP plans</button>
                <button type="button" onClick={() => setActiveSection('all-plans')}>View all plans</button>
                <button type="button" onClick={() => setActiveSection('withdrawals')}>Review withdrawals</button>
                <button type="button" onClick={() => setActiveSection('user-plans')}>Review user plans</button>
              </div>
            </div>
            {/* Site limits moved to its own section */}
          </div>
        ) : null}

        {activeSection === 'add-plan' ? (
          <section className="admin-panel">
            <div className="admin-panel__header">
              <h2>{editingId ? 'Update plan details' : 'Create a new plan'}</h2>
              <p>Pick the category first so the plan appears in the correct tab on the client.</p>
            </div>

            <form className="plan-form" onSubmit={savePlan}>
              <label>
                Category
                <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                  <option value="day">Day income</option>
                  <option value="vip">VIP plan</option>
                </select>
              </label>
              <label>
                Title
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="Plan title"
                  required
                />
              </label>
              <label>
                Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setSelectedImage(event.target.files?.[0] || null)}
                />
              </label>
              <div className="admin-image-preview">
                {imagePreview ? <img src={imagePreview} alt="Plan preview" /> : <span>No image selected</span>}
              </div>
              <label>
                Badge label
                <input
                  type="text"
                  value={form.badgeLabel}
                  onChange={(event) => setForm({ ...form, badgeLabel: event.target.value })}
                  placeholder="Plan A"
                />
              </label>
              <label>
                Price
                <input
                  type="number"
                  value={form.price}
                  onChange={(event) => setForm({ ...form, price: event.target.value })}
                  placeholder="550"
                  required
                />
              </label>
              <label>
                Daily earning
                <input
                  type="number"
                  value={form.dailyEarning}
                  onChange={(event) => setForm({ ...form, dailyEarning: event.target.value })}
                  placeholder="130"
                  required
                />
              </label>
              <label>
                Duration days
                <input
                  type="number"
                  value={form.durationDays}
                  onChange={(event) => setForm({ ...form, durationDays: event.target.value })}
                  placeholder="180"
                  required
                />
              </label>
              <label>
                Total earning
                <input
                  type="number"
                  value={form.totalEarning}
                  onChange={(event) => setForm({ ...form, totalEarning: event.target.value })}
                  placeholder="23400"
                  required
                />
              </label>
              <label>
                Sort order
                <input
                  type="number"
                  value={form.order}
                  onChange={(event) => setForm({ ...form, order: event.target.value })}
                  placeholder="1"
                />
              </label>
              <label className="switch-field">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => setForm({ ...form, active: event.target.checked })}
                />
                Active
              </label>
              {error ? <p className="form-error">{error}</p> : null}
              <button className="primary-button" type="submit" disabled={loading}>
                {editingId ? 'Update plan' : 'Add plan'}
              </button>
              {editingId ? (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setEditingId('');
                    setForm(emptyPlan);
                    setSelectedImage(null);
                  }}
                >
                  Cancel edit
                </button>
              ) : null}
            </form>
          </section>
        ) : null}

        {activeSection === 'day' || activeSection === 'vip' || activeSection === 'all-plans' ? (
          <section className="admin-panel">
            <div className="admin-panel__header">
              <h2>
                {activeSection === 'all-plans'
                  ? 'All plans'
                  : activeSection === 'day'
                    ? 'Day income plans'
                    : 'VIP plans'}
              </h2>
              <p>
                {activeSection === 'all-plans'
                  ? 'All active plans with category labels.'
                  : 'These plans are filtered by category.'}
              </p>
            </div>

            <div className="admin-plan-list admin-plan-list--dense">
              {visiblePlans.map((plan) => (
                <article key={plan._id} className="admin-plan-item">
                  <img src={plan.imageUrl} alt={plan.title} />
                  <div>
                    <div className="admin-plan-item__title-row">
                      <h3>{plan.title}</h3>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span className={`admin-plan-pill admin-plan-pill--${plan.category}`}>
                          {plan.category === 'day' ? 'Day income' : 'VIP plan'}
                        </span>
                        <span className={`admin-plan-pill ${plan.active ? 'admin-plan-pill--active' : 'admin-plan-pill--inactive'}`}>
                          {plan.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <p>Price: ₹ {Number(plan.price).toLocaleString('en-IN')}</p>
                    <p>Daily: ₹ {Number(plan.dailyEarning).toLocaleString('en-IN')}</p>
                    <p>Duration: {plan.durationDays} days</p>
                  </div>
                  <div className="admin-plan-item__actions">
                    <button type="button" onClick={() => handleEdit(plan)}>
                      {plan.active ? 'Edit' : 'Activate'}
                    </button>
                    <button type="button" onClick={() => handleDelete(plan._id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {activeSection === 'withdrawals' ? (
          <section className="admin-panel">
            <div className="admin-panel__header">
              <h2>Withdrawal requests</h2>
              <p>Approve or reject withdrawal requests and review the bank details attached to each request.</p>
            </div>

            <div className="admin-status-filters">
              {['pending', 'approved', 'rejected', 'all'].map((status) => (
                <button
                  key={status}
                  type="button"
                  className={withdrawalFilter === status ? 'is-active' : ''}
                  onClick={() => setWithdrawalFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>

            {withdrawalLoading ? (
              <div className="device-empty-state records-empty-state">Loading...</div>
            ) : filteredWithdrawals.length === 0 ? (
              <div className="device-empty-state records-empty-state">NO DATA</div>
            ) : (
              <div className="admin-withdrawal-list">
                {filteredWithdrawals.map((withdrawal) => {
                  const expanded = expandedWithdrawalId === String(withdrawal._id);
                  return (
                    <article
                      key={withdrawal._id}
                      className={`admin-withdrawal-card ${expanded ? 'is-expanded' : 'is-collapsed'}`}
                    >
                      <div
                        className="admin-withdrawal-card__header"
                        role="button"
                        tabIndex={0}
                        onClick={() => setExpandedWithdrawalId(expanded ? null : String(withdrawal._id))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') setExpandedWithdrawalId(expanded ? null : String(withdrawal._id));
                        }}
                      >
                        <div>
                          <h3>{withdrawal.user?.phone || 'Unknown user'}</h3>
                          <p>{formatDate(withdrawal.createdAt)}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800 }}>{formatAmount(withdrawal.amount)}</div>
                            <div style={{ fontSize: 12, color: '#7b6f5c' }}>{withdrawal.user?.phone ? 'Requested' : ''}</div>
                          </div>
                          <span className={`record-card__status record-card__status--${withdrawal.status}`}>{withdrawal.status}</span>
                        </div>
                      </div>

                      {expanded ? (
                        <>
                          <div className="admin-withdrawal-card__grid">
                            <div>
                              <span>Amount</span>
                              <strong>{formatAmount(withdrawal.amount)}</strong>
                            </div>
                            <div>
                              <span>Account name</span>
                              <strong>{withdrawal.bankDetailsSnapshot?.realName || withdrawal.user?.bankDetails?.realName || '-'}</strong>
                            </div>
                            <div>
                              <span>IFSC</span>
                              <strong>{withdrawal.bankDetailsSnapshot?.ifsc || withdrawal.user?.bankDetails?.ifsc || '-'}</strong>
                            </div>
                            <div>
                              <span>Account number</span>
                              <strong>{withdrawal.bankDetailsSnapshot?.accountNumber || withdrawal.user?.bankDetails?.accountNumber || '-'}</strong>
                            </div>
                            <div>
                              <span>Available balance</span>
                              <strong>{formatAmount(withdrawal.user?.balance)}</strong>
                            </div>
                            <div>
                              <span>Total income</span>
                              <strong>{formatAmount(withdrawal.user?.totalIncome)}</strong>
                            </div>
                          </div>

                          {withdrawal.adminNote ? <p className="admin-withdrawal-card__note">Note: {withdrawal.adminNote}</p> : null}

                          {withdrawal.status === 'pending' ? (
                            <div className="admin-withdrawal-card__actions">
                              <button
                                type="button"
                                className="primary-button"
                                onClick={() => handleWithdrawalAction(withdrawal._id, 'approved')}
                                disabled={processingWithdrawalId === withdrawal._id}
                              >
                                {processingWithdrawalId === withdrawal._id ? 'Processing...' : 'Approve'}
                              </button>
                              <button
                                type="button"
                                className="secondary-button"
                                onClick={() => handleWithdrawalAction(withdrawal._id, 'rejected')}
                                disabled={processingWithdrawalId === withdrawal._id}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <div className="admin-withdrawal-card__footer">
                              <span>Processed at: {formatDate(withdrawal.processedAt)}</span>
                              <span>Processed by: {withdrawal.processedBy?.phone || '-'}</span>
                            </div>
                          )}
                        </>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        ) : null}

        {activeSection === 'limits' ? (
          <section className="admin-panel">
            <div className="admin-panel__header">
              <h2>Site limits</h2>
              <p>Configure minimum recharge and withdrawal amounts.</p>
            </div>

            <form className="admin-config-form" onSubmit={saveAdminConfig}>
              <label>
                Minimum recharge
                <input
                  type="number"
                  value={adminConfig.minRecharge}
                  onChange={(e) => setAdminConfig({ ...adminConfig, minRecharge: e.target.value })}
                  required
                />
              </label>
              <label>
                Minimum withdrawal
                <input
                  type="number"
                  value={adminConfig.minWithdrawal}
                  onChange={(e) => setAdminConfig({ ...adminConfig, minWithdrawal: e.target.value })}
                  required
                />
              </label>
              {configSuccess ? <p className="form-success">{configSuccess}</p> : null}
              {error ? <p className="form-error">{error}</p> : null}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="primary-button" type="submit" disabled={savingConfig}>
                  {savingConfig ? 'Saving...' : 'Save limits'}
                </button>
              </div>
            </form>
          </section>
        ) : null}

        {activeSection === 'user-plans' ? (
          <section className="admin-panel">
            <div className="admin-panel__header">
              <h2>User plans</h2>
              <p>View all user purchased plans and delete any plan entry if needed.</p>
            </div>

            {userPlansLoading ? (
              <div className="device-empty-state records-empty-state">Loading...</div>
            ) : userPlans.length === 0 ? (
              <div className="device-empty-state records-empty-state">NO DATA</div>
            ) : (
              <div className="admin-withdrawal-list">
                {userPlans.map((item) => {
                  const expanded = expandedUserPlanId === String(item._id);
                  const status = item.active ? 'active' : 'expired';

                  return (
                    <article key={item._id} className={`admin-withdrawal-card ${expanded ? 'is-expanded' : 'is-collapsed'}`}>
                      <div
                        className="admin-withdrawal-card__header"
                        role="button"
                        tabIndex={0}
                        onClick={() => setExpandedUserPlanId(expanded ? '' : String(item._id))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') setExpandedUserPlanId(expanded ? '' : String(item._id));
                        }}
                      >
                        <div>
                          <h3>{item.user?.phone || 'Unknown user'} - {item.planTitle || item.plan?.title || 'Plan'}</h3>
                          <p>{formatDate(item.createdAt)}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800 }}>{formatAmount(item.dailyEarning)}</div>
                            <div style={{ fontSize: 12, color: '#7b6f5c' }}>Daily</div>
                          </div>
                          <span className={`record-card__status record-card__status--${status === 'active' ? 'approved' : 'rejected'}`}>
                            {status}
                          </span>
                        </div>
                      </div>

                      {expanded ? (
                        <>
                          <div className="admin-withdrawal-card__grid">
                            <div>
                              <span>Plan</span>
                              <strong>{item.planTitle || item.plan?.title || '-'}</strong>
                            </div>
                            <div>
                              <span>Category</span>
                              <strong>{item.plan?.category || '-'}</strong>
                            </div>
                            <div>
                              <span>Price</span>
                              <strong>{formatAmount(item.price)}</strong>
                            </div>
                            <div>
                              <span>Daily income</span>
                              <strong>{formatAmount(item.dailyEarning)}</strong>
                            </div>
                            <div>
                              <span>Duration</span>
                              <strong>{item.durationDays} days</strong>
                            </div>
                            <div>
                              <span>Credited days</span>
                              <strong>{item.creditedDays || 0}</strong>
                            </div>
                            <div>
                              <span>Start date</span>
                              <strong>{formatDate(item.startsAt)}</strong>
                            </div>
                            <div>
                              <span>Expiry date</span>
                              <strong>{formatDate(item.expiresAt)}</strong>
                            </div>
                          </div>

                          <div className="admin-withdrawal-card__actions">
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() => handleDeleteUserPlan(item._id)}
                              disabled={deletingUserPlanId === item._id}
                            >
                              {deletingUserPlanId === item._id ? 'Deleting...' : 'Delete plan'}
                            </button>
                          </div>
                        </>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        ) : null}

        {error && activeSection !== 'add-plan' ? <p className="form-error admin-section-error">{error}</p> : null}
      </section>
    </main>
  );
};

export default AdminPage;
