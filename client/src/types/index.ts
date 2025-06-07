export interface JobDescription {
  id: string;
  title: string;
  company?: string;
  fileUrl?: string;
  parsedText: string;
  skills: {
    required: string[];
    niceToHave: string[];
  };
  createdAt: string;
  updatedAt: string;
  analyses?: Analysis[];
}

export interface Candidate {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  fileUrl?: string;
  parsedText: string;
  location?: string;
  seniority?: string;
  techStack: string[];
  createdAt: string;
  updatedAt: string;
  analyses?: Analysis[];
}

export interface Analysis {
  id: string;
  candidateId: string;
  jobId: string;
  matchPercentage: number;
  topSkills: string[];
  missingSkills: string[];
  generatedMessage?: string;
  messageTemplate?: 'high_match' | 'mid_match' | 'low_match';
  candidate?: Candidate;
  job?: JobDescription;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResponse {
  id: string;
  name?: string;
  title?: string;
  company?: string;
  email?: string;
  tags?: {
    location?: string;
    seniority?: string;
    tech?: string[];
  };
  skills?: {
    required: string[];
    niceToHave: string[];
  };
  experienceLevel?: string;
} 