import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('userInfo');
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getReports = () => api.get('/reports');
export const getReport = (interviewId) => api.get(`/reports/${interviewId}`);

export const getRoadmap = () => api.get('/roadmap');
export const generateRoadmap = (targetRole) => api.post('/roadmap/generate', { targetRole });
export const toggleRoadmapTask = (id, weekIndex, taskIndex) => api.put(`/roadmap/${id}/task`, { weekIndex, taskIndex });

export const getCommunityPosts = () => api.get('/community/posts');
export const createCommunityPost = (postData) => api.post('/community/post', postData);
export const replyToPost = (id, content) => api.post(`/community/post/${id}/reply`, { content });
export const likePost = (id) => api.put(`/community/post/${id}/like`);
export const getLeaderboard = () => api.get('/community/leaderboard');

export const getProfile = () => api.get('/profile');
export const updateProfile = (profileData) => api.put('/profile', profileData);

export const updateSettings = (settingsData) => api.put('/settings', settingsData);
export const changePassword = (passwordData) => api.put('/settings/password', passwordData);

export default api;
