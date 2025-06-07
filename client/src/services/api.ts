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

// Demo mode localStorage helpers
const DEMO_STORAGE_KEY = 'demo_recruiter_data';

function getDemoData() {
  const stored = localStorage.getItem(DEMO_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Default demo data
  return {
    jobs: [
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
    ],
    candidates: [
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
    ],
    analyses: [
      {
        id: 'demo-analysis-1',
        candidateId: 'demo-candidate-1',
        jobId: 'demo-job-1', 
        matchPercentage: 92,
        topSkills: ['React', 'TypeScript', 'Node.js'],
        missingSkills: [],
        generatedMessage: "Hi Alex! I came across your profile and was impressed by your React and TypeScript expertise. We have an exciting Senior React Developer position at TechCorp that seems like a perfect match for your skillset. Would you be interested in learning more?",
        createdAt: new Date().toISOString()
      }
    ]
  };
}

function saveDemoData(data: any) {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
}

function generateDemoUpload(file: File, type: 'job' | 'candidate') {
  const data = getDemoData();
  const id = `demo-${type}-${Date.now()}`;
  
  if (type === 'job') {
    const newJob = {
      id,
      title: `Demo Job: ${file.name.replace(/\.[^/.]+$/, "")}`,
      company: 'Demo Company',
      skills: { required: ['Demo Skill', 'Communication'], niceToHave: ['Leadership'] },
      createdAt: new Date().toISOString()
    };
    data.jobs.push(newJob);
    saveDemoData(data);
    return newJob;
  } else {
    const newCandidate = {
      id,
      name: `Demo Candidate: ${file.name.replace(/\.[^/.]+$/, "")}`,
      email: 'demo@example.com',
      location: 'Demo City',
      seniority: 'Demo Level',
      techStack: ['Demo Skill', 'Problem Solving'],
      createdAt: new Date().toISOString()
    };
    data.candidates.push(newCandidate);
    saveDemoData(data);
    return {
      id: newCandidate.id,
      name: newCandidate.name,
      email: newCandidate.email,
      tags: {
        location: newCandidate.location,
        seniority: newCandidate.seniority,
        tech: newCandidate.techStack
      }
    };
  }
}

function generateDemoAnalysis(candidateId: string, jobId: string) {
  const data = getDemoData();
  const candidate = data.candidates.find((c: any) => c.id === candidateId);
  const job = data.jobs.find((j: any) => j.id === jobId);
  
  if (!candidate || !job) {
    return null;
  }
  
  const matchPercentage = Math.floor(Math.random() * 40) + 60; // 60-100%
  const analysis = {
    id: `demo-analysis-${Date.now()}`,
    candidateId,
    jobId,
    matchPercentage,
    topSkills: job.skills.required.slice(0, 3),
    missingSkills: matchPercentage < 80 ? ['Advanced Skills'] : [],
    generatedMessage: `Hi ${candidate.name}! I came across your profile and think you'd be a great fit for the ${job.title} position at ${job.company}. Your skills align well with what we're looking for. Interested in learning more?`,
    candidate,
    job,
    createdAt: new Date().toISOString()
  };
  
  data.analyses.push(analysis);
  saveDemoData(data);
  return analysis;
}

// Demo mode mock responses
function getDemoResponse(url: string, method: string) {
  console.log('getDemoResponse called with:', url, method);
  
  const data = getDemoData();

  // Route-based mock responses
  if (!url) return [];

  if (url.includes('/job-descriptions')) {
    if (method?.toLowerCase() === 'get') {
      return data.jobs;
    }
    if (method?.toLowerCase() === 'post') {
      // This will be handled by the file upload simulation
      return { success: true };
    }
  }

  if (url.includes('/candidates')) {
    if (method?.toLowerCase() === 'get') {
      return data.candidates;
    }
    if (method?.toLowerCase() === 'post') {
      // This will be handled by the file upload simulation  
      return { success: true };
    }
  }

  if (url.includes('/analysis')) {
    if (method?.toLowerCase() === 'get') {
      // If it's a specific analysis request (e.g., /analysis/candidateId/jobId)
      if (url.match(/\/analysis\/[^\/]+\/[^\/]+$/)) {
        const [candidateId, jobId] = url.split('/').slice(-2);
        return data.analyses.find((a: any) => a.candidateId === candidateId && a.jobId === jobId) || data.analyses[0];
      }
      // Otherwise return list of analyses
      return data.analyses;
    }
    if (method?.toLowerCase() === 'post') {
      // This will be handled by the analysis simulation
      return { success: true };
    }
  }

  console.log('No mock data matched for:', url, method);
  return [];
}

// Job Descriptions
export const jobDescriptionApi = {
  upload: async (file: File) => {
    const token = localStorage.getItem('token');
    
    // Demo mode simulation
    if (!token) {
      console.log('Demo mode: simulating job upload for', file.name);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time
      return generateDemoUpload(file, 'job');
    }
    
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
    const token = localStorage.getItem('token');
    
    // Demo mode simulation
    if (!token) {
      console.log('Demo mode: simulating candidate upload for', file.name);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time
      return generateDemoUpload(file, 'candidate');
    }
    
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
    const token = localStorage.getItem('token');
    
    // Demo mode simulation
    if (!token) {
      console.log('Demo mode: simulating analysis for', candidateId, jobId);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI processing time
      return generateDemoAnalysis(candidateId, jobId);
    }
    
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