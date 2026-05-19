import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import RechargePage from './pages/my/RechargePage';
import RechargeRecordsPage from './pages/my/RechargeRecordsPage';
import BankCardPage from './pages/my/BankCardPage';
import WithdrawalPage from './pages/my/WithdrawalPage';
import WithdrawalRecordsPage from './pages/my/WithdrawalRecordsPage';
import PlansPage from './pages/my/PlansPage';
import TeamPage from './pages/index/TeamPage';
import DevicesPage from './pages/index/DevicesPage';
import SharePage from './pages/index/SharePage';
import MyPage from './pages/index/MyPage';
import PersonalInfoPage from './pages/PersonalInfoPage';
import PasswordUpdatePage from './pages/PasswordUpdatePage';
import AboutPage from './pages/index/AboutPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/pages/my/recharge" element={<RechargePage />} />
        <Route path="/pages/my/rechargelist" element={<RechargeRecordsPage />} />
        <Route path="/pages/my/card" element={<BankCardPage />} />
        <Route path="/pages/my/withdrawal" element={<WithdrawalPage />} />
        <Route path="/pages/my/withdrawallist" element={<WithdrawalRecordsPage />} />
        <Route path="/pages/my/plans" element={<PlansPage />} />
        <Route path="/pages/my/infolist" element={<PersonalInfoPage />} />
        <Route path="/pages/my/balancelist" element={<DevicesPage activeTab="my" />} />
        <Route path="/pages/my/password" element={<PasswordUpdatePage mode="login" />} />
        <Route path="/pages/my/withdrawal-password" element={<PasswordUpdatePage mode="withdrawal" />} />
        <Route path="/pages/index/myteam" element={<TeamPage />} />
        <Route path="/pages/index/devices" element={<DevicesPage activeTab="devices" />} />
        <Route path="/pages/index/income" element={<DevicesPage activeTab="my" />} />
        <Route path="/pages/index/personal" element={<PersonalInfoPage />} />
        <Route path="/pages/index/share" element={<SharePage />} />
        <Route path="/pages/index/about" element={<AboutPage />} />
        <Route path="/pages/index/my" element={<MyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
