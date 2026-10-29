import api from './axios';

// BabyCare System Check — trained ML model (backend: /api/ai/)

// 5 System Check cards (fever, cold_cough, teething_pain, diarrhea, sleep_issues) + en/ur/roman labels
export const getSymptoms = () => api.get('/ai/symptoms/').then((res) => res.data);

// payload: { symptoms: ['fever', ...], age: '6–12 months', duration: '1–2 days', additional, language: 'en' | 'ur' | 'roman' }
export const diagnose = (payload) => api.post('/ai/diagnose/', payload).then((res) => res.data);
