// lib/api.ts

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour rafraîchir le token (CORRIGÉ)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Éviter les boucles infinies
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // Vérifier si c'est une erreur 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh/`, { refresh });
          
          if (response.data.access) {
            localStorage.setItem('access_token', response.data.access);
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh token invalide - déconnexion
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // Pas de refresh token - déconnexion
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Fonctions API
export const auth = {
  login: (username: string, password: string) =>
    api.post('/auth/login/', { username, password }),
  register: (data: any) => api.post('/auth/register/', data),
  profile: () => api.get('/auth/profile/'),
  logout: () => {
    localStorage.clear();
    window.location.href = '/';
  },
};

export const members = {
  profile: () => api.get('/members/profile/'),
  update: (data: any) => api.put('/members/profile/', data),
  verify: (id: string) => api.get(`/members/verify/${id}/`),
};

export const courses = {
  list: () => api.get('/courses/'),
  detail: (id: number) => api.get(`/courses/${id}/`),
  categories: () => api.get('/courses/categories/'),
};

export const projects = {
  list: () => api.get('/projects/'),
  detail: (id: number) => api.get(`/projects/${id}/`),
};
export const events = {
  list: () => api.get('/events/'),
  detail: (id: number) => api.get(`/events/${id}/`),
};
// lib/api.ts

export const blog = {
  list: () => api.get('/blog/'),
  detail: (id: number) => api.get(`/blog/${id}/`),
};
// lib/api.ts

export const certificates = {
  list: () => api.get('/certificates/'),
  detail: (id: number) => api.get(`/certificates/${id}/`),
};
export const opportunities = {
  list: () => api.get('/opportunities/'),
};