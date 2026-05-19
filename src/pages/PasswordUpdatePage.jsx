import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { changePassword, changeWithdrawalPassword } from '../services/profile';

const configByMode = {
  login: {
    title: 'Change Password',
    submitLabel: 'Update password',
    helperText: 'Enter the current login password and confirm the new one.',
    currentLabel: 'Old password',
    currentPlaceholder: 'Enter old password',
    nextLabel: 'New password',
    nextPlaceholder: 'Enter new password',
    confirmLabel: 'Confirm new password',
    confirmPlaceholder: 'Confirm new password',
    action: changePassword,
  },
  withdrawal: {
    title: 'Change Withdrawal Password',
    submitLabel: 'Update withdrawal password',
    helperText: 'Enter the current withdrawal password and confirm the new one.',
    currentLabel: 'Old withdrawal password',
    currentPlaceholder: 'Enter old withdrawal password',
    nextLabel: 'New withdrawal password',
    nextPlaceholder: 'Enter new withdrawal password',
    confirmLabel: 'Confirm new withdrawal password',
    confirmPlaceholder: 'Confirm new withdrawal password',
    action: changeWithdrawalPassword,
  },
};

const PasswordUpdatePage = ({ mode = 'login' }) => {
  const token = window.localStorage.getItem('corona_token');
  const navigate = useNavigate();
  const config = configByMode[mode] || configByMode.login;
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback('');

    try {
      if (mode === 'withdrawal') {
        await config.action({
          oldWithdrawalPassword: form.oldPassword,
          newWithdrawalPassword: form.newPassword,
          confirmNewWithdrawalPassword: form.confirmNewPassword,
        });
      } else {
        await config.action({
          oldPassword: form.oldPassword,
          newPassword: form.newPassword,
          confirmNewPassword: form.confirmNewPassword,
        });
      }

      setForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
      setFeedback('Saved successfully');
    } catch (requestError) {
      setFeedback(requestError?.response?.data?.message || 'Unable to update password');
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
        <button type="button" className="mobile-topbar__back" aria-label="Back" onClick={() => navigate(-1)}>
          <span>‹</span>
        </button>
        <h1>{config.title}</h1>
      </header>

      <section className="page-card page-card--tight page-card--centered">
        <div className="profile-summary-card profile-summary-card--compact">
          <p className="profile-summary-card__label">Security</p>
          <h2>{config.title}</h2>
          <p>{config.helperText}</p>
        </div>

        <form className="stacked-form" onSubmit={handleSubmit}>
          <label>
            <span>{config.currentLabel}</span>
            <input
              type="password"
              value={form.oldPassword}
              onChange={(event) => setForm({ ...form, oldPassword: event.target.value })}
              placeholder={config.currentPlaceholder}
              required
            />
          </label>
          <label>
            <span>{config.nextLabel}</span>
            <input
              type="password"
              value={form.newPassword}
              onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
              placeholder={config.nextPlaceholder}
              required
            />
          </label>
          <label>
            <span>{config.confirmLabel}</span>
            <input
              type="password"
              value={form.confirmNewPassword}
              onChange={(event) => setForm({ ...form, confirmNewPassword: event.target.value })}
              placeholder={config.confirmPlaceholder}
              required
            />
          </label>
          {feedback ? <p className="form-feedback">{feedback}</p> : null}
          <button type="submit" className="recharge-submit" disabled={saving}>
            {saving ? 'Saving...' : config.submitLabel}
          </button>
        </form>
      </section>

      <BottomNav activeTab="my" />
    </main>
  );
};

export default PasswordUpdatePage;