import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../services/api';
import Carousel from '../components/Carousel';
import ActionGrid from '../components/ActionGrid';
import PlanCard from '../components/PlanCard';
import BottomNav from '../components/BottomNav';
import WelcomeModal from '../components/WelcomeModal';
import carouselImageOne from '../images/curosel-1.jpg';
import carouselImageTwo from '../images/curosel-2.avif';

const carouselSlides = [carouselImageOne, carouselImageTwo];

const HomePage = () => {
  const navigate = useNavigate();
  const token = window.localStorage.getItem('corona_token');
  const user = JSON.parse(window.localStorage.getItem('corona_user') || 'null');

  const [config, setConfig] = useState({ heroImages: [] });
  const [plans, setPlans] = useState([]);
  const [activeCategory, setActiveCategory] = useState('day');
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      return;
    }

    setAuthToken(token);

    const load = async () => {
      try {
        const [configResponse, plansResponse] = await Promise.all([api.get('/config'), api.get('/plans')]);

        setConfig(configResponse.data);
        setPlans(plansResponse.data.plans || []);

        // always open welcome modal on each page load
        setWelcomeOpen(true);
      } catch (_error) {
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate, token, user?.id]);

  const filteredPlans = useMemo(
    () => plans.filter((plan) => plan.category === activeCategory),
    [plans, activeCategory]
  );

  if (!token) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    window.localStorage.removeItem('corona_token');
    window.localStorage.removeItem('corona_user');
    setAuthToken(null);
    navigate('/', { replace: true });
  };

  const handleBuy = (plan) => {
    // show a styled toast message instead of native alert
    setToastMessage(`Purchased: ${plan.title}`);
    setTimeout(() => setToastMessage(''), 2600);
  };

  const [toastMessage, setToastMessage] = useState('');

  if (loading) {
    return <div className="app-loading">Loading...</div>;
  }

  return (
    <main className="app-shell">
      <WelcomeModal
        open={welcomeOpen}
            companyName={config.companyName || 'OLA-EV scooter'}
        config={config}
        onClose={() => setWelcomeOpen(false)}
      />

      <section className="app-card">
        <header className="top-banner">
          <div className="top-banner__image">
            <Carousel slides={carouselSlides} />
          </div>
        </header>

        <ActionGrid onChannelClick={() => window.open(config.joinChannelUrl, '_blank', 'noreferrer')} />

        <div className="segment-tabs">
          <button className={activeCategory === 'day' ? 'is-active' : ''} type="button" onClick={() => setActiveCategory('day')}>
            Day income
          </button>
          <button className={activeCategory === 'vip' ? 'is-active' : ''} type="button" onClick={() => setActiveCategory('vip')}>
            VIP Plan
          </button>
        </div>

        <div className="plan-list">
          {filteredPlans.map((plan) => (
            <PlanCard key={plan._id} plan={plan} onBuy={handleBuy} />
          ))}
        </div>

        <div className="home-actions">
          <button className="secondary-button" type="button" onClick={() => window.open(config.serviceUrl, '_blank', 'noreferrer')}>
            Service center
          </button>
          <button className="secondary-button" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </section>

      <BottomNav activeTab="home" />
      {toastMessage && (
        <div className="app-toast" role="status">{toastMessage}</div>
      )}
    </main>
  );
};

export default HomePage;
