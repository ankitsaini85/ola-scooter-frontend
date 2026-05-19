import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DeviceIcon, HomeIcon, ShareIcon, TeamIcon, UserIcon } from './Icons';

const tabs = [
  { key: 'home', label: 'Home', icon: HomeIcon },
  { key: 'team', label: 'Team', icon: TeamIcon },
  { key: 'share', label: 'Share', icon: ShareIcon },
  { key: 'devices', label: 'Devices', icon: DeviceIcon },
  { key: 'my', label: 'My', icon: UserIcon },
];

const routeMap = {
  home: '/home',
  team: '/pages/index/myteam',
  share: '/pages/index/share',
  devices: '/pages/index/devices',
  my: '/pages/index/my',
};

const BottomNav = ({ activeTab }) => {
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            className={activeTab === tab.key ? 'is-active' : ''}
            type="button"
            onClick={() => navigate(routeMap[tab.key] || '/home')}
          >
            <Icon />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
