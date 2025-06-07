import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { analyzeMatch, generateFollowUpMessage } from '../utils/ai-service';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Analyze candidate-job match
router.post('/:candidateId/:jobId', async (req, res) => {
  try {
    const { candidateId, jobId } = req.params;
    const userId = req.user!.userId;
    
    // Check if analysis already exists
    const existingAnalysis = await prisma.analysis.findFirst({
      where: {
        candidateId,
        jobId,
        userId,
      },
    });
    
    if (existingAnalysis) {
      return res.json(existingAnalysis);
    }
    
    // Get candidate and job data (ensure they belong to the user)
    const [candidate, job] = await Promise.all([
      prisma.candidate.findFirst({ 
        where: { id: candidateId, userId } 
      }),
      prisma.jobDescription.findFirst({ 
        where: { id: jobId, userId } 
      }),
    ]);
    
    if (!candidate || !job) {
      return res.status(404).json({ error: 'Candidate or job not found' });
    }
    
    // Analyze match with OpenAI
    const matchResult = await analyzeMatch(job.parsedText, candidate.parsedText);
    
    // Determine message template
    let messageTemplate: string;
    if (matchResult.matchPercentage >= 80) {
      messageTemplate = 'high_match';
    } else if (matchResult.matchPercentage >= 60) {
      messageTemplate = 'mid_match';
    } else {
      messageTemplate = 'low_match';
    }
    
    // Generate follow-up message
    const generatedMessage = generateFollowUpMessage(
      matchResult.matchPercentage,
      candidate.name,
      matchResult.topSkills[0] || 'your skills',
      matchResult.missingSkills[0]
    );
    
    // Save analysis
    const analysis = await prisma.analysis.create({
      data: {
        userId,
        candidateId,
        jobId,
        matchPercentage: matchResult.matchPercentage,
        topSkills: matchResult.topSkills,
        missingSkills: matchResult.missingSkills,
        generatedMessage,
        messageTemplate,
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            location: true,
            seniority: true,
            techStack: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            skills: true,
          },
        },
      },
    });
    
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing match:', error);
    res.status(500).json({ error: 'Failed to analyze match' });
  }
});

// Get analysis for candidate-job pair (user-specific)
router.get('/:candidateId/:jobId', async (req, res) => {
  try {
    const { candidateId, jobId } = req.params;
    const userId = req.user!.userId;
    
    const analysis = await prisma.analysis.findFirst({
      where: {
        candidateId,
        jobId,
        userId,
      },
      include: {
        candidate: true,
        job: true,
      },
    });
    
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    
    res.json(analysis);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

// Regenerate message for an analysis (user-specific)
router.post('/:analysisId/regenerate-message', async (req, res) => {
  try {
    const userId = req.user!.userId;
    
    const analysis = await prisma.analysis.findFirst({
      where: { 
        id: req.params.analysisId,
        userId 
      },
      include: { candidate: true },
    });
    
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    
    // Generate new message
    const newMessage = generateFollowUpMessage(
      analysis.matchPercentage,
      analysis.candidate.name,
      (analysis.topSkills as string[])[0] || 'your skills',
      (analysis.missingSkills as string[])[0]
    );
    
    // Update analysis
    const updatedAnalysis = await prisma.analysis.update({
      where: { id: req.params.analysisId },
      data: { generatedMessage: newMessage },
    });
    
    res.json({ message: updatedAnalysis.generatedMessage });
  } catch (error) {
    console.error('Error regenerating message:', error);
    res.status(500).json({ error: 'Failed to regenerate message' });
  }
});

// Get all analyses for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.userId;
    
    const analyses = await prisma.analysis.findMany({
      where: { userId },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            company: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    res.json(analyses);
  } catch (error) {
    console.error('Error fetching analyses:', error);
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
});

export default router; 