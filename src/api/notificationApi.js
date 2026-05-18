import { api } from './client';

export const notificationApi = {
  list: (page = 1, limit = 15) => api.get(`/notifications?page=${page}&limit=${limit}`),
  unreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/read/${id}`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  create: (payload) => api.post('/notifications/create', payload),
};
