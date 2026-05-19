import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneIcon, PaperPlaneIcon, RotateCwIcon, UploadIcon } from './Icons';

const items = [
  { label: 'Recharge', icon: RotateCwIcon },
  { label: 'Withdraw', icon: UploadIcon },
  { label: 'Service', icon: PhoneIcon },
  { label: 'Channel', icon: PaperPlaneIcon },
];

const ActionGrid = ({ onChannelClick }) => {
  const navigate = useNavigate();

  return (
    <div className="action-grid">
      {items.map((item) => {
        const Icon = item.icon;
        const handleClick = () => {
          if (item.label === 'Channel') {
            onChannelClick?.();
            return;
          }

          if (item.label === 'Recharge') {
            navigate('/pages/my/recharge');
            return;
          }

          if (item.label === 'Withdraw') {
            navigate('/pages/my/withdrawal');
            return;
          }
        };

        return (
          <button
            key={item.label}
            className="action-card"
            type="button"
            onClick={handleClick}
          >
            <span className="action-card__icon">
              <Icon />
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ActionGrid;
