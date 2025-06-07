import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Job Descriptions
export const jobDescriptionApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/job-descriptions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  getAll: async () => {
    const response = await api.get('/job-descriptions');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/job-descriptions/${id}`);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/job-descriptions/${id}`);
    return response.data;
  },
};

// Candidates
export const candidateApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/candidates', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  getAll: async () => {
    const response = await api.get('/candidates');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/candidates/${id}`);
    return response.data;
  },
  
  getForJob: async (jobId: string) => {
    const response = await api.get(`/candidates/for-job/${jobId}`);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/candidates/${id}`);
    return response.data;
  },
};

// Analysis
export const analysisApi = {
  analyze: async (candidateId: string, jobId: string) => {
    const response = await api.post(`/analysis/${candidateId}/${jobId}`);
    return response.data;
  },
  
  get: async (candidateId: string, jobId: string) => {
    const response = await api.get(`/analysis/${candidateId}/${jobId}`);
    return response.data;
  },
  
  getAll: async () => {
    const response = await api.get('/analysis');
    return response.data;
  },
  
  regenerateMessage: async (analysisId: string) => {
    const response = await api.post(`/analysis/${analysisId}/regenerate-message`);
    return response.data;
  },
};

export default api; 