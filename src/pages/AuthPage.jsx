import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../services/api';

const initialRegister = {
  phone: '',
  password: '',
  confirmPassword: '',
  withdrawalPassword: '',
  referralCode: '',
};

const initialLogin = {
  phone: '',
  password: '',
};

const AuthPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const referralFromUrl = params.get('ref') || params.get('referralCode');
    if (referralFromUrl) {
      setRegisterForm((current) => ({
        ...current,
        referralCode: referralFromUrl,
      }));
    }
  }, []);

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', registerForm);
      window.localStorage.setItem('corona_token', response.data.token);
      window.localStorage.setItem('corona_user', JSON.stringify(response.data.user));
      setAuthToken(response.data.token);
      navigate('/home', { replace: true });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', loginForm);
      window.localStorage.setItem('corona_token', response.data.token);
      window.localStorage.setItem('corona_user', JSON.stringify(response.data.user));
      setAuthToken(response.data.token);
      navigate('/home', { replace: true });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-screen">
      <div className="auth-shell">
        <section className="auth-hero">
          <p className="eyebrow">OLA-EV scooter</p>
          <h1>Register or log in to access daily plans, live income cards, and withdrawal tools.</h1>
          <p>
            The interface is tuned for mobile first, but it stays centered and polished on desktop as well.
          </p>
          <div className="auth-hero__notes">
            <span>Phone number login</span>
            <span>Withdrawal password support</span>
            {/* <span>Admin-ready backend</span> */}
          </div>
          {/* <Link className="auth-hero__admin-link" to="/admin">
            Open admin page
          </Link> */}
        </section>

        <section className="auth-card">
          <div className="auth-tabs">
            <button className={mode === 'login' ? 'is-active' : ''} type="button" onClick={() => setMode('login')}>
              Login
            </button>
            <button className={mode === 'register' ? 'is-active' : ''} type="button" onClick={() => setMode('register')}>
              Register
            </button>
          </div>

          {mode === 'login' ? (
            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <label>
                Number
                <input
                  type="tel"
                  value={loginForm.phone}
                  onChange={(event) => setLoginForm({ ...loginForm, phone: event.target.value })}
                  placeholder="Enter your number"
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                  placeholder="Enter your password"
                  required
                />
              </label>
              {error ? <p className="form-error">{error}</p> : null}
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegisterSubmit}>
              <label>
                Number
                <input
                  type="tel"
                  value={registerForm.phone}
                  onChange={(event) => setRegisterForm({ ...registerForm, phone: event.target.value })}
                  placeholder="Enter your number"
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
                  placeholder="Create a password"
                  required
                />
              </label>
              <label>
                Confirm password
                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(event) => setRegisterForm({ ...registerForm, confirmPassword: event.target.value })}
                  placeholder="Confirm your password"
                  required
                />
              </label>
              <label>
                Withdrawal password
                <input
                  type="password"
                  value={registerForm.withdrawalPassword}
                  onChange={(event) => setRegisterForm({ ...registerForm, withdrawalPassword: event.target.value })}
                  placeholder="Used for withdrawal requests"
                  required
                />
              </label>
              <label>
                Referral code
                <input
                  type="text"
                  value={registerForm.referralCode}
                  onChange={(event) => setRegisterForm({ ...registerForm, referralCode: event.target.value })}
                  placeholder="Optional referral code"
                />
              </label>
              {error ? <p className="form-error">{error}</p> : null}
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
};

export default AuthPage;
