import api from './api';

const getStoredUser = () => {
  try {
    return JSON.parse(window.localStorage.getItem('corona_user') || 'null');
  } catch (_error) {
    return null;
  }
};

export const storeCurrentUser = (user) => {
  const storedUser = getStoredUser() || {};
  const nextUser = {
    ...storedUser,
    ...user,
    bankDetails: {
      ...(storedUser.bankDetails || {}),
      ...(user.bankDetails || {}),
    },
  };

  window.localStorage.setItem('corona_user', JSON.stringify(nextUser));
  return nextUser;
};

export const loadCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return storeCurrentUser(response.data.user);
};

export const saveBankDetails = async (bankDetails) => {
  const response = await api.put('/auth/bank-details', bankDetails);
  return storeCurrentUser(response.data.user);
};

export const changePassword = async (passwords) => {
  const response = await api.put('/auth/password', passwords);
  return response.data;
};

export const changeWithdrawalPassword = async (passwords) => {
  const response = await api.put('/auth/withdrawal-password', passwords);
  return response.data;
};

export const createWithdrawalRequest = async (payload) => {
  const response = await api.post('/transactions/withdrawals', payload);
  return response.data;
};

export const listWithdrawalRequests = async () => {
  const response = await api.get('/transactions/withdrawals');
  return response.data.withdrawals || [];
};

export const listAdminWithdrawalRequests = async () => {
  const response = await api.get('/admin/withdrawals');
  return response.data.withdrawals || [];
};

export const setWithdrawalRequestStatus = async (id, payload) => {
  const response = await api.patch(`/admin/withdrawals/${id}`, payload);
  return response.data;
};

export const getAdminConfig = async () => {
  const response = await api.get('/admin/config');
  return response.data.config;
};

export const updateAdminConfig = async (payload) => {
  const response = await api.patch('/admin/config', payload);
  return response.data;
};

export const listAdminUserPlans = async () => {
  const response = await api.get('/admin/user-plans');
  return response.data.purchases || [];
};

export const deleteAdminUserPlan = async (id) => {
  const response = await api.delete(`/admin/user-plans/${id}`);
  return response.data;
};