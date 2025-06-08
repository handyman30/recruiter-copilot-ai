import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { analyzeMatch, generateFollowUpMessage } from '../utils/ai-service';
import { authMiddleware } from '../middleware/auth';
import { demoRateLimit } from '../middleware/rateLimiting';

const router = Router();

// Make auth optional for demo users (they'll be rate limited)
const optionalAuth = (req: any, res: any, next: any) => {
  const sessionId = req.headers['x-session-id'];
  if (sessionId && !req.headers.authorization) {
    // Demo user, skip auth
    req.userId = undefined;
    return next();
  }
  // Regular auth for logged-in users
  return authMiddleware(req, res, next);
};

// Apply optional auth middleware to all routes
router.use(optionalAuth);

// Analyze candidate-job match
router.post('/:candidateId/:jobId', demoRateLimit, async (req, res) => {
  try {
    const { candidateId, jobId } = req.params;
    const userId = req.user?.userId || req.userId;
    const isDemo = !userId;
    
    if (isDemo) {
      // For demo users, generate demo analysis
      const matchPercentage = Math.floor(Math.random() * 40) + 60; // 60-100%
      
      const topSkills = [
        'JavaScript', 'React', 'Node.js', 'TypeScript', 'Python',
        'AWS', 'Docker', 'Git', 'SQL', 'REST APIs'
      ].sort(() => 0.5 - Math.random()).slice(0, 3);
      
      const missingSkills = [
        'Kubernetes', 'GraphQL', 'Redis', 'MongoDB', 'Vue.js',
        'Angular', 'DevOps', 'CI/CD', 'Microservices'
      ].sort(() => 0.5 - Math.random()).slice(0, 2);
      
      let messageTemplate: string;
      if (matchPercentage >= 80) {
        messageTemplate = 'high_match';
      } else if (matchPercentage >= 60) {
        messageTemplate = 'mid_match';
      } else {
        messageTemplate = 'low_match';
      }
      
      const generatedMessage = generateFollowUpMessage(
        matchPercentage,
        'Demo Candidate',
        topSkills[0],
        missingSkills[0]
      );
      
      // Return demo analysis
      const demoAnalysis = {
        id: `demo-${candidateId}-${jobId}`,
        candidateId,
        jobId,
        matchPercentage,
        topSkills,
        missingSkills,
        generatedMessage,
        messageTemplate,
        isDemo: true,
        createdAt: new Date().toISOString(),
        candidate: {
          id: candidateId,
          name: 'Demo Candidate',
          email: 'demo@example.com',
          location: 'San Francisco, CA',
          seniority: 'Senior',
          techStack: topSkills
        },
        job: {
          id: jobId,
          title: 'Demo Job Position',
          company: 'Demo Company',
          skills: [...topSkills, ...missingSkills]
        }
      };
      
      return res.json(demoAnalysis);
    }
    
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
    
    // Check usage limits for free users
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        subscriptionPlan: true
      }
    });

    // If user is not on a paid plan, check daily usage
    if (!user?.subscriptionStatus || user.subscriptionStatus !== 'ACTIVE' || user.subscriptionPlan === 'free') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayAnalyses = await prisma.analysis.count({
        where: {
          userId,
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      });

      const DAILY_FREE_LIMIT = 2;
      
      if (todayAnalyses >= DAILY_FREE_LIMIT) {
        return res.status(429).json({ 
          error: 'Daily match limit exceeded', 
          message: `You've used ${todayAnalyses}/${DAILY_FREE_LIMIT} daily matches. Upgrade to Pro for unlimited matches!`,
          upgradeUrl: '/pricing',
          dailyUsage: {
            used: todayAnalyses,
            limit: DAILY_FREE_LIMIT,
            remaining: 0
          }
        });
      }
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
    const userId = req.user?.userId || req.userId;
    
    // Demo users don't have saved analyses
    if (!userId) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    
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
    const userId = req.user?.userId || req.userId;
    
    // Demo users can't regenerate messages
    if (!userId) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    
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
    const userId = req.user?.userId || req.userId;
    
    // Demo users don't have saved analyses - return empty array
    if (!userId) {
      return res.json([]);
    }
    
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