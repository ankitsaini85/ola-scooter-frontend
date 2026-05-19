import React from 'react';
import { CloseIcon, PaperPlaneIcon } from './Icons';
import welcomeimage from '../images/welcome.png';
const WelcomeModal = ({ open, companyName, config, onClose }) => {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="welcome-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="welcome-modal__close" type="button" aria-label="Close welcome popup" onClick={onClose}>
          <CloseIcon />
        </button>
        <h2>{companyName}</h2>
        <div className="welcome-modal__banner">
          <img src={welcomeimage} alt={`${companyName} welcome`} />
        </div>
        <p className="welcome-modal__headline">Welcome to {companyName} Company!</p>
        <div className="welcome-modal__rules">
          {/* <strong>{config.bonusText}</strong> */}
          <span>{config.dailyText}</span>
          {
            (() => {
              // Prefer server-provided text, but override the numeric limits per request:
              // change 550 -> 580 and 130 -> 120 while keeping any surrounding text.
              const rawDeposit = config.depositText || `Minimum Deposit: ${config.minRecharge ?? 550} rupees`;
              const rawWithdraw = config.withdrawText || `Minimum Withdrawal: ${config.minWithdrawal ?? 130} rupees`;
              const displayDeposit = rawDeposit.replace(/550/g, '580');
              const displayWithdraw = rawWithdraw.replace(/130/g, '120');
              return (
                <>
                  <span>{displayDeposit}</span>
                  <span>{displayWithdraw}</span>
                </>
              );
            })()
          }
        </div>
        <a className="welcome-modal__join" href={config.joinChannelUrl} target="_blank" rel="noreferrer">
          <PaperPlaneIcon />
          Join Channel
        </a>
      </div>
    </div>
  );
};

export default WelcomeModal;
