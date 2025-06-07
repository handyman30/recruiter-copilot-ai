import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { z } from 'zod';

// Schemas remain the same
const JobAnalysisSchema = z.object({
  title: z.string(),
  company: z.string().optional(),
  requiredSkills: z.array(z.string()),
  niceToHaveSkills: z.array(z.string()).optional(),
  experienceLevel: z.string().optional(),
});

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

const MatchAnalysisSchema = z.object({
  matchPercentage: z.number().min(0).max(100),
  topSkills: z.array(z.string()).max(3),
  missingSkills: z.array(z.string()),
  reasoning: z.string().optional(),
});

// AI Service abstraction
class AIService {
  private gemini?: GoogleGenerativeAI;
  private openai?: OpenAI;
  private useGemini?: boolean;
  private initialized = false;

  private initialize() {
    if (this.initialized) return;
    
    this.useGemini = process.env.USE_GEMINI === 'true';
    
    if (this.useGemini) {
      console.log('🚀 Using Google Gemini for AI processing (FREE!)');
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    } else {
      console.log('💰 Using OpenAI for AI processing');
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    
    this.initialized = true;
  }

  private async callGemini(prompt: string): Promise<string> {
    this.initialize();
    const model = this.gemini!.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Add JSON instruction to prompt for Gemini
    const enhancedPrompt = prompt + "\n\nIMPORTANT: Return ONLY valid JSON, no markdown formatting or backticks.";
    
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up response if needed (remove any markdown formatting)
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return cleanedText;
  }

  private async callOpenAI(prompt: string, useGPT4: boolean = false): Promise<string> {
    this.initialize();
    const response = await this.openai!.chat.completions.create({
      model: useGPT4 ? 'gpt-4' : 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    return response.choices[0].message.content || '';
  }

  async analyzeJobDescription(text: string) {
    this.initialize();
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

    try {
      const content = this.useGemini 
        ? await this.callGemini(prompt)
        : await this.callOpenAI(prompt);

      const parsed = JSON.parse(content);
      return JobAnalysisSchema.parse(parsed);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Provide a fallback response
      return {
        title: 'Software Engineer',
        company: undefined,
        requiredSkills: [],
        niceToHaveSkills: [],
        experienceLevel: 'Mid-level'
      };
    }
  }

  async analyzeResume(text: string) {
    this.initialize();
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

    try {
      const content = this.useGemini 
        ? await this.callGemini(prompt)
        : await this.callOpenAI(prompt);

      const parsed = JSON.parse(content);
      return ResumeAnalysisSchema.parse(parsed);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Provide a fallback response
      return {
        name: 'Unknown Candidate',
        email: undefined,
        location: undefined,
        seniority: 'Mid-level',
        skills: [],
        experience: []
      };
    }
  }

  async analyzeMatch(jobText: string, resumeText: string) {
    this.initialize();
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

    try {
      // For matching, we might want to use GPT-4 equivalent for better accuracy
      const content = this.useGemini 
        ? await this.callGemini(prompt)
        : await this.callOpenAI(prompt, true); // Use GPT-4 for matching

      const parsed = JSON.parse(content);
      return MatchAnalysisSchema.parse(parsed);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Provide a fallback response
      return {
        matchPercentage: 50,
        topSkills: [],
        missingSkills: [],
        reasoning: 'Unable to analyze match at this time'
      };
    }
  }
}

// Export a singleton instance
export const aiService = new AIService();

// Export the same functions to maintain compatibility
export const analyzeJobDescription = (text: string) => aiService.analyzeJobDescription(text);
export const analyzeResume = (text: string) => aiService.analyzeResume(text);
export const analyzeMatch = (jobText: string, resumeText: string) => aiService.analyzeMatch(jobText, resumeText);

// Keep the message generation function as-is
export { generateFollowUpMessage } from './openai'; 