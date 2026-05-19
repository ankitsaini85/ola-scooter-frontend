import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { loadCurrentUser } from '../services/profile';

const shortcutItems = [
  { title: 'Bind Bank Card', description: 'Add or update bank details', path: '/pages/my/card' },
  { title: 'Change Password', description: 'Update login password', path: '/pages/my/password' },
  { title: 'Change Withdrawal Password', description: 'Update withdrawal password', path: '/pages/my/withdrawal-password' },
];

const PersonalInfoPage = () => {
  const token = window.localStorage.getItem('corona_token');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const user = await loadCurrentUser();
        setProfile(user);
      } catch (_error) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="screen-shell">
      <header className="mobile-topbar">
        <Link to="/home" className="mobile-topbar__back" aria-label="Back to home">
          <span>‹</span>
        </Link>
        <h1>Personal Information</h1>
      </header>

      <section className="page-card page-card--tight personal-page">
        <div className="profile-summary-card">
          <p className="profile-summary-card__label">Account</p>
          <h2>{profile?.phone || 'Guest user'}</h2>
          <p>{profile?.referralCode ? `Referral code: ${profile.referralCode}` : 'Manage account settings from here.'}</p>
          <div className="profile-summary-card__meta">
            <span>{profile?.bankDetails?.realName ? 'Bank card saved' : 'Bank card not set'}</span>
            <span>{loading ? 'Loading...' : 'Ready'}</span>
          </div>
        </div>

        <div className="settings-list">
          {shortcutItems.map((item) => (
            <Link key={item.title} to={item.path} className="settings-card">
              <div>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </div>
              <span aria-hidden="true">›</span>
            </Link>
          ))}
        </div>
      </section>

      <BottomNav activeTab="my" />
    </main>
  );
};

export default PersonalInfoPage;