import OpenAI from 'openai';
import { z } from 'zod';

// Lazy initialization of OpenAI client
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

// Schema for job description analysis
const JobAnalysisSchema = z.object({
  title: z.string(),
  company: z.string().optional(),
  requiredSkills: z.array(z.string()),
  niceToHaveSkills: z.array(z.string()).optional(),
  experienceLevel: z.string().optional(),
});

// Schema for resume analysis
const ResumeAnalysisSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
  location: z.string().optional(),
  seniority: z.enum(['Junior', 'Mid-level', 'Senior', 'Lead', 'Principal']).optional(),
  skills: z.array(z.string()),
  experience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    duration: z.string().optional(),
  })).optional(),
});

// Schema for match analysis
const MatchAnalysisSchema = z.object({
  matchPercentage: z.number().min(0).max(100),
  topSkills: z.array(z.string()).max(3),
  missingSkills: z.array(z.string()),
  reasoning: z.string().optional(),
});

export async function analyzeJobDescription(text: string) {
  const openai = getOpenAIClient();
  
  const prompt = `
    Analyze this job description and extract key information.
    Return a JSON object with:
    - title: job title
    - company: company name (if mentioned)
    - requiredSkills: array of required technical skills
    - niceToHaveSkills: array of nice-to-have skills
    - experienceLevel: Junior/Mid-level/Senior/Lead/Principal
    
    Job Description:
    ${text}
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No response from OpenAI');

  const parsed = JSON.parse(content);
  return JobAnalysisSchema.parse(parsed);
}

export async function analyzeResume(text: string) {
  const openai = getOpenAIClient();
  
  const prompt = `
    Analyze this resume and extract key information.
    Return a JSON object with:
    - name: candidate's full name
    - email: email address (if found)
    - location: city/state/country (if mentioned)
    - seniority: Junior/Mid-level/Senior/Lead/Principal (based on experience)
    - skills: array of technical skills mentioned
    - experience: array of work experiences with title, company, duration
    
    Resume:
    ${text}
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No response from OpenAI');

  const parsed = JSON.parse(content);
  return ResumeAnalysisSchema.parse(parsed);
}

export async function analyzeMatch(jobText: string, resumeText: string) {
  const openai = getOpenAIClient();
  
  const prompt = `
    Compare this job description with the candidate's resume.
    Calculate a match percentage (0-100) based on:
    - Required skills match (60% weight)
    - Experience level match (20% weight)
    - Nice-to-have skills (20% weight)
    
    Return a JSON object with:
    - matchPercentage: number between 0-100
    - topSkills: array of up to 3 most relevant skills the candidate has
    - missingSkills: array of important required skills the candidate lacks
    - reasoning: brief explanation of the match score
    
    Job Description:
    ${jobText}
    
    Resume:
    ${resumeText}
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No response from OpenAI');

  const parsed = JSON.parse(content);
  return MatchAnalysisSchema.parse(parsed);
}

export function generateFollowUpMessage(
  matchScore: number,
  candidateName: string,
  topSkill: string,
  missingSkill?: string
): string {
  if (matchScore >= 80) {
    return `Hey ${candidateName}, I had a look at your resume — you seem like a great fit for a role we're hiring for. Your experience with ${topSkill} particularly caught my attention. Are you open for a quick call this week?`;
  } else if (matchScore >= 60) {
    return `Thanks for sharing your resume, ${candidateName}. I can see strong experience in ${topSkill}, but we're currently prioritizing candidates with more depth in ${missingSkill || 'some key areas'}. I'll keep you in mind for future opportunities!`;
  } else {
    return `Hi ${candidateName}, thanks for applying! At this stage, the role requires strong ${missingSkill || 'technical'} experience, which we couldn't quite match from your resume. Happy to chat about future roles though — stay in touch!`;
  }
} 