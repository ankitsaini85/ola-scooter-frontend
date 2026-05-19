import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { setAuthToken } from '../../services/api';
import BottomNav from '../../components/BottomNav';
import bannerImg from '../../images/curosel-1.jpg';
import logoImg from '../../images/curosel-2.avif';

const shortcuts = [
  { label: 'Recharge', path: '/pages/my/rechargelist' },
  { label: 'Withdraw', path: '/pages/my/withdrawallist' },
  { label: 'Bind bank card', path: '/pages/my/card' },
];

const MyPage = () => {
  const [user, setUser] = useState(JSON.parse(window.localStorage.getItem('corona_user') || 'null'));

  useEffect(() => {
    const token = window.localStorage.getItem('corona_token');
    if (!token) return;
    setAuthToken(token);

    const load = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data && res.data.user) {
          setUser(res.data.user);
          window.localStorage.setItem('corona_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        // ignore - keep local user
      }
    };

    load();
  }, []);

  return (
    <main className="screen-shell">
      <header className="mobile-topbar">
        <Link to="/home" className="mobile-topbar__back" aria-label="Back to home">
          <span>‹</span>
        </Link>
        <h1>My</h1>
      </header>

      <section className="page-card page-card--tight my-page">
        <div className="my-banner" style={{ backgroundImage: `url(${bannerImg})` }}>
          <div className="my-banner__overlay">
            <div className="my-logo-wrap">
              <img src={logoImg} alt="Logo" className="my-logo" />
            </div>
            <div className="my-id-row">
              <strong>ID : {user?.phone || 'Guest'}</strong>
              <span className="vip-badge">VIP0</span>
            </div>

            <div className="my-stats-row">
                <div className="stat-box">
                  <div className="stat-amount">₹ {Number(user?.balance || 0).toLocaleString('en-IN')}</div>
                  <div className="stat-label">Balance</div>
                </div>
                <div className="stat-box">
                  <div className="stat-amount">₹ {Number(user?.totalIncome || 0).toLocaleString('en-IN')}</div>
                  <div className="stat-label">Total income</div>
                </div>
                <div className="stat-box">
                  <div className="stat-amount">₹ {Number(user?.totalRecharge || 0).toLocaleString('en-IN')}</div>
                  <div className="stat-label">Recharge</div>
                </div>
            </div>
          </div>
        </div>

        {/* <div className="profile-card">
          <p className="profile-card__label">Account</p>
          <h2>{user?.phone || 'Guest user'}</h2>
          <p>Manage your recharge, withdrawal, and bank details from here.</p>
        </div> */}

        <div className="my-shortcuts">
          <Link to="/pages/my/infolist" className="my-shortcut">Personal information</Link>
          <Link to="/pages/my/balancelist" className="my-shortcut">Income details</Link>
          <Link to="/pages/my/rechargelist" className="my-shortcut">Recharge details</Link>
          <Link to="/pages/my/plans" className="my-shortcut">Plans</Link>
          <Link to="/pages/my/withdrawallist" className="my-shortcut">Withdrawal details</Link>
          <Link to="/pages/my/card" className="my-shortcut">Bind bank card</Link>
          <Link to="/pages/index/about" className="my-shortcut">About us</Link>
          <Link to="/pages/index/logout" className="my-shortcut">Log out</Link>
        </div>
      </section>

      <BottomNav activeTab="my" />
    </main>
  );
};

export default MyPage;
