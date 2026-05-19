import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';

const announcementText =
  'OLA-EV scooter provides clean, efficient electric mobility solutions. We focus on sustainable transport, battery innovation, and accessible charging infrastructure. Our platform helps users manage vehicle plans, charging credits, and community referrals to grow a network of sustainable drivers.';

const AboutPage = () => {
  const token = window.localStorage.getItem('corona_token');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="screen-shell">
      <header className="mobile-topbar">
        <Link to="/pages/index/my" className="mobile-topbar__back" aria-label="Back to my page">
          <span>‹</span>
        </Link>
        <h1>Announcement</h1>
      </header>

      <section className="page-card page-card--tight announcement-page">
        <div className="announcement-card">
          <p>{announcementText}</p>
        </div>
      </section>

      <BottomNav activeTab="my" />
    </main>
  );
};

export default AboutPage;