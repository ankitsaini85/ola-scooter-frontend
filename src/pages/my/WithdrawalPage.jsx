import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import { createWithdrawalRequest, loadCurrentUser, saveBankDetails } from '../../services/profile';

const WithdrawalPage = () => {
  const token = window.localStorage.getItem('corona_token');
  const [bankDetails, setBankDetails] = useState({
    realName: '',
    ifsc: '',
    accountNumber: '',
  });
  const [bankEditorOpen, setBankEditorOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [savingBank, setSavingBank] = useState(false);
  const [withdrawal, setWithdrawal] = useState({ amount: '', password: '' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [profile, setProfile] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

  const hasBankDetails = useMemo(
    () => Boolean(bankDetails.realName && bankDetails.ifsc && bankDetails.accountNumber),
    [bankDetails]
  );

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const user = await loadCurrentUser();
        setProfile(user);
        const nextBankDetails = {
          realName: user.bankDetails?.realName || '',
          ifsc: user.bankDetails?.ifsc || '',
          accountNumber: user.bankDetails?.accountNumber || '',
        };

        setBankDetails(nextBankDetails);
        setBankEditorOpen(!(nextBankDetails.realName && nextBankDetails.ifsc && nextBankDetails.accountNumber));
      } catch (_error) {
        setMessage('Unable to load withdrawal details');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const handleBankSave = async (event) => {
    event.preventDefault();
    setMessage('');
    setSavingBank(true);

    try {
      await saveBankDetails(bankDetails);
      setBankEditorOpen(false);
      setMessage('Bank details saved');
      setMessageType('success');
    } catch (requestError) {
      setMessage(requestError?.response?.data?.message || 'Unable to save bank details');
      setMessageType('error');
    } finally {
      setSavingBank(false);
    }
  };

  const openConfirm = (event) => {
    event.preventDefault();
    setMessage('');

    const numericAmount = Number(withdrawal.amount);

    if (!hasBankDetails) {
      setMessage('Bank details are required before withdrawal');
      setMessageType('error');
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setMessage('Please enter a valid withdrawal amount');
      setMessageType('error');
      return;
    }

    if (!withdrawal.password) {
      setMessage('Withdrawal password is required');
      setMessageType('error');
      return;
    }

    if (numericAmount > Number(profile?.totalIncome || 0)) {
      setMessage('Withdrawal amount cannot exceed available income');
      setMessageType('error');
      return;
    }

    setConfirmOpen(true);
  };

  const submitWithdrawal = async () => {
    // close confirm modal immediately so any success/error messages are visible
    setConfirmOpen(false);
    setSubmittingWithdrawal(true);
    setMessage('');

    try {
      const response = await createWithdrawalRequest({
        amount: Number(withdrawal.amount),
        password: withdrawal.password,
      });

      if (response.user) {
        const localUser = JSON.parse(window.localStorage.getItem('corona_user') || 'null') || {};
        const updated = {
          ...localUser,
          balance: response.user.balance,
          totalRecharge: response.user.totalRecharge ?? localUser.totalRecharge,
          totalIncome: response.user.totalIncome ?? localUser.totalIncome,
        };
        window.localStorage.setItem('corona_user', JSON.stringify(updated));
        setProfile({
          ...(profile || {}),
          balance: response.user.balance,
          totalRecharge: response.user.totalRecharge,
          totalIncome: response.user.totalIncome,
        });
      }

      setConfirmOpen(false);
      setWithdrawal({ amount: '', password: '' });
      setMessage('Withdrawal request submitted successfully');
      setMessageType('success');
    } catch (requestError) {
      setMessage(requestError?.response?.data?.message || 'Unable to submit withdrawal request');
      setMessageType('error');
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="screen-shell">
      <header className="mobile-topbar">
        <Link to="/home" className="mobile-topbar__back" aria-label="Back to home">
          <span>‹</span>
        </Link>
        <h1>Withdraw</h1>
      </header>

      <section className="page-card page-card--tight">
        {loading ? (
          <div className="app-loading">Loading withdrawal details...</div>
        ) : (
          <>
            {(bankEditorOpen || !hasBankDetails) && (
              <form className="page-card__subsection" onSubmit={handleBankSave}>
                <div className="bank-info-card bank-info-card--form">
                  <label>
                    <span>Real Name</span>
                    <input
                      type="text"
                      value={bankDetails.realName}
                      onChange={(event) => setBankDetails({ ...bankDetails, realName: event.target.value })}
                      placeholder="Enter real name"
                    />
                  </label>
                  <label>
                    <span>IFSC</span>
                    <input
                      type="text"
                      value={bankDetails.ifsc}
                      onChange={(event) => setBankDetails({ ...bankDetails, ifsc: event.target.value })}
                      placeholder="Enter IFSC"
                    />
                  </label>
                  <label>
                    <span>Bank Account Number</span>
                    <input
                      type="text"
                      value={bankDetails.accountNumber}
                      onChange={(event) => setBankDetails({ ...bankDetails, accountNumber: event.target.value })}
                      placeholder="Enter Bank Account Number"
                    />
                  </label>
                </div>

                <button type="submit" className="bind-card-button" disabled={savingBank}>
                  {savingBank ? 'Saving...' : 'Save bank details'}
                </button>

                <div className="notice-stack notice-stack--compact">
                  <div className="notice-box">Bank details are required before withdrawal.</div>
                  <div className="notice-box">Please make sure your account name matches the bank card.</div>
                </div>
              </form>
            )}

            {hasBankDetails && !bankEditorOpen ? (
              <div className="page-card__subsection">
                <div className="bank-info-card bank-info-card--summary">
                  <p>Real Name: {bankDetails.realName}</p>
                  <p>IFSC: {bankDetails.ifsc}</p>
                  <p>Bank Account Number: {bankDetails.accountNumber}</p>
                </div>

                <button type="button" className="bind-card-button bind-card-button--secondary" onClick={() => setBankEditorOpen(true)}>
                  Edit bank details
                </button>
              </div>
            ) : null}

            {message ? (
              <p className={`form-feedback ${messageType === 'success' ? 'form-success' : messageType === 'error' ? 'form-error' : ''}`}>
                {message}
              </p>
            ) : null}

            {hasBankDetails ? (
              <form className="withdraw-card" onSubmit={openConfirm}>
                <h2>Amount</h2>
                <div className="withdraw-input-row">
                  <span>₹</span>
                  <input
                    type="number"
                    value={withdrawal.amount}
                    onChange={(event) => setWithdrawal({ ...withdrawal, amount: event.target.value })}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <p className="withdraw-balance">Income: ₹ {Number(profile?.totalIncome || 0).toLocaleString('en-IN')}</p>
                <div className="withdraw-input-row withdraw-input-row--password">
                  <span>🔒</span>
                  <input
                    type="password"
                    value={withdrawal.password}
                    onChange={(event) => setWithdrawal({ ...withdrawal, password: event.target.value })}
                    placeholder="Withdrawal password"
                  />
                </div>
                <button type="submit" className="recharge-submit">
                  Withdraw {withdrawal.amount ? Number(withdrawal.amount).toLocaleString('en-IN') : '0'}
                </button>
              </form>
            ) : null}

            {confirmOpen ? (
              <div className="modal-backdrop" role="presentation" onClick={() => setConfirmOpen(false)}>
                <div className="withdraw-confirm-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
                  <p className="eyebrow">Confirm withdrawal</p>
                  <h2>Submit this request?</h2>
                  <div className="withdraw-confirm-modal__summary">
                    <div>
                      <span>Amount</span>
                      <strong>₹ {Number(withdrawal.amount || 0).toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      <span>Account name</span>
                      <strong>{bankDetails.realName}</strong>
                    </div>
                    <div>
                      <span>IFSC</span>
                      <strong>{bankDetails.ifsc}</strong>
                    </div>
                    <div>
                      <span>Account number</span>
                      <strong>{bankDetails.accountNumber}</strong>
                    </div>
                  </div>
                  <div className="withdraw-confirm-modal__actions">
                    <button type="button" className="secondary-button" onClick={() => setConfirmOpen(false)} disabled={submittingWithdrawal}>
                      Cancel
                    </button>
                    <button type="button" className="primary-button" onClick={submitWithdrawal} disabled={submittingWithdrawal}>
                      {submittingWithdrawal ? 'Submitting...' : 'Confirm request'}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>

      <BottomNav activeTab="my" />
    </main>
  );
};

export default WithdrawalPage;
