import axios from 'axios';

const api = axios.create({
  baseURL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api'
    : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors and connection errors for demo mode
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = localStorage.getItem('token');
    
    // If no token (demo mode), return mock data for any error
    if (!token) {
      console.log('Demo mode: returning mock data for', error.config?.url);
      return Promise.resolve({
        data: getDemoResponse(error.config?.url, error.config?.method)
      });
    }
    
    // If we have a token but get 401, it's expired
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.reload();
    }
    
    return Promise.reject(error);
  }
);

// Demo mode mock responses
function getDemoResponse(url: string, method: string) {
  console.log('getDemoResponse called with:', url, method);
  
  const demoJobs = [
    {
      id: 'demo-job-1',
      title: 'Senior React Developer',
      company: 'TechCorp Inc.',
      skills: { required: ['React', 'TypeScript', 'Node.js'], niceToHave: ['GraphQL'] },
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-job-2', 
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      skills: { required: ['JavaScript', 'Python', 'PostgreSQL'], niceToHave: ['Docker'] },
      createdAt: new Date().toISOString()
    }
  ];

  const demoCandidates = [
    {
      id: 'demo-candidate-1',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      location: 'San Francisco, CA',
      seniority: 'Senior',
      techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-candidate-2',
      name: 'Sarah Chen', 
      email: 'sarah@example.com',
      location: 'New York, NY',
      seniority: 'Mid-level',
      techStack: ['JavaScript', 'Python', 'React', 'MongoDB'],
      createdAt: new Date().toISOString()
    }
  ];

  const demoAnalysis = {
    id: 'demo-analysis-1',
    candidateId: 'demo-candidate-1',
    jobId: 'demo-job-1', 
    matchPercentage: 92,
    topSkills: ['React', 'TypeScript', 'Node.js'],
    missingSkills: [],
    generatedMessage: "Hi Alex! I came across your profile and was impressed by your React and TypeScript expertise. We have an exciting Senior React Developer position at TechCorp that seems like a perfect match for your skillset. Would you be interested in learning more?",
    candidate: demoCandidates[0],
    job: demoJobs[0],
    createdAt: new Date().toISOString()
  };

  // Route-based mock responses
  if (!url) return [];

  if (url.includes('/job-descriptions')) {
    if (method?.toLowerCase() === 'get') {
      return demoJobs;
    }
    if (method?.toLowerCase() === 'post') {
      return {
        id: 'demo-job-new',
        title: 'New Demo Position',
        company: 'Demo Company',
        skills: { required: ['Demo Skill'], niceToHave: [] }
      };
    }
  }

  if (url.includes('/candidates')) {
    if (method?.toLowerCase() === 'get') {
      return demoCandidates;
    }
    if (method?.toLowerCase() === 'post') {
      return {
        id: 'demo-candidate-new', 
        name: 'Demo Candidate',
        email: 'demo@example.com',
        tags: { location: 'Demo City', seniority: 'Demo Level', tech: ['Demo Tech'] }
      };
    }
  }

  if (url.includes('/analysis')) {
    if (method?.toLowerCase() === 'get') {
      // If it's a specific analysis request (e.g., /analysis/candidateId/jobId)
      if (url.match(/\/analysis\/[^\/]+\/[^\/]+$/)) {
        return demoAnalysis;
      }
      // Otherwise return list of analyses
      return [demoAnalysis];
    }
    if (method?.toLowerCase() === 'post') {
      // Return analysis result for any POST to analysis
      return demoAnalysis;
    }
  }

  console.log('No mock data matched for:', url, method);
  return [];
}

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