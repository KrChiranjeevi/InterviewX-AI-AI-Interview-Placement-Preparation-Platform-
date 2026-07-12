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
export const getSavedRoadmaps = () => api.get('/roadmap/saved');
export const generateRoadmap = (searchQuery) => api.post('/roadmap/generate', { searchQuery });
export const toggleRoadmapTask = (id, moduleIndex, topicIndex, taskIndex, taskType) => api.put(`/roadmap/${id}/task`, { moduleIndex, topicIndex, taskIndex, taskType });
export const bookmarkRoadmap = (id) => api.put(`/roadmap/${id}/bookmark`);
export const compareRoadmaps = (topic1, topic2) => api.post('/roadmap/compare', { topic1, topic2 });
export const askMentor = (message, history) => api.post('/roadmap/ask-mentor', { message, history });
export const getTopicDetail = (id, moduleIndex, topicIndex) => api.post(`/roadmap/${id}/topic-detail`, { moduleIndex, topicIndex });

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
