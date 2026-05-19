import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import shareBanner from '../../images/curosel-2.avif';
import api from '../../services/api';

const SharePage = () => {
  const [referralCode, setReferralCode] = useState(() => {
    const stored = window.localStorage.getItem('corona_user');
    try {
      const parsed = stored ? JSON.parse(stored) : null;
      return parsed?.referralCode || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    if (referralCode) return;
    const token = window.localStorage.getItem('corona_token');
    if (!token) return;

    (async () => {
      try {
        const res = await api.get('/auth/me');
        const code = res.data.user?.referralCode;
        if (code) {
          setReferralCode(code);
          const stored = window.localStorage.getItem('corona_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.referralCode = code;
            window.localStorage.setItem('corona_user', JSON.stringify(parsed));
          }
        }
      } catch (_e) {
        // ignore
      }
    })();
  }, [referralCode]);

  const shareUrl = useMemo(() => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?ref=${referralCode || 'guest'}`;
  }, [referralCode]);

  const handleCopy = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (_error) {
      window.prompt('Copy this value', value);
    }
  };

  return (
    <main className="screen-shell">
      <header className="mobile-topbar">
        <Link to="/home" className="mobile-topbar__back" aria-label="Back to home">
          <span>‹</span>
        </Link>
        <h1>Share</h1>
      </header>

      <section className="page-card page-card--tight share-page">
        <div className="share-banner">
          <img src={shareBanner} alt="OLA-EV scooter share banner" />
        </div>

        <div className="share-copy-stack">
          <div className="share-copy-row">
            <span>{shareUrl}</span>
            <button type="button" onClick={() => handleCopy(shareUrl)}>
              Copy
            </button>
          </div>

          <div className="share-copy-row">
            <span>{referralCode || 'guest'}</span>
            <button
              type="button"
              onClick={() => handleCopy(referralCode || shareUrl)}
            >
              Copy
            </button>
          </div>
        </div>

        <div className="share-rules-card">
          <p>Users who register through the link and purchase the plan will receive corresponding commissions.</p>
          <div className="share-level-list">
            <div className="share-level-box">A-25%</div>
            <div className="share-level-box">B-3%</div>
            <div className="share-level-box">C-2%</div>
          </div>
        </div>
      </section>

      <BottomNav activeTab="share" />
    </main>
  );
};

export default SharePage;
