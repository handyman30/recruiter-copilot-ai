import { Router } from 'express';
import { upload } from '../utils/upload';
import { parseDocument, cleanText } from '../utils/fileParser';
import { analyzeResume } from '../utils/ai-service';
import { prisma } from '../utils/prisma';
import { deleteUploadedFile } from '../utils/upload';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Upload and analyze candidate resume
router.post('/', upload.single('file'), async (req, res) => {
  let filePath: string | undefined;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user!.userId;
    filePath = req.file.path;
    
    // Parse document
    const rawText = await parseDocument(filePath, req.file.mimetype);
    const cleanedText = cleanText(rawText);
    
    // Analyze with OpenAI
    const analysis = await analyzeResume(cleanedText);
    
    // Save to database
    const candidate = await prisma.candidate.create({
      data: {
        userId,
        name: analysis.name,
        email: analysis.email,
        fileUrl: filePath,
        parsedText: cleanedText,
        location: analysis.location,
        seniority: analysis.seniority,
        techStack: analysis.skills,
      },
    });
    
    res.json({
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      tags: {
        location: candidate.location,
        seniority: candidate.seniority,
        tech: candidate.techStack,
      },
    });
  } catch (error) {
    console.error('Error processing candidate resume:', error);
    res.status(500).json({ error: 'Failed to process resume' });
  } finally {
    // Clean up uploaded file if needed
    if (filePath && process.env.NODE_ENV === 'production') {
      await deleteUploadedFile(filePath);
    }
  }
});

// Get all candidates for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.userId;
    
    const candidates = await prisma.candidate.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        seniority: true,
        techStack: true,
        createdAt: true,
      },
    });
    
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Get single candidate with analyses (user-specific)
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user!.userId;
    
    const candidate = await prisma.candidate.findFirst({
      where: { 
        id: req.params.id,
        userId 
      },
      include: {
        analyses: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                company: true,
              },
            },
          },
        },
      },
    });
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    res.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

// Get candidates for a specific job (user-specific)
router.get('/for-job/:jobId', async (req, res) => {
  try {
    const userId = req.user!.userId;
    
    const candidates = await prisma.candidate.findMany({
      where: {
        userId,
        analyses: {
          some: {
            jobId: req.params.jobId,
            userId, // Ensure analysis also belongs to user
          },
        },
      },
      include: {
        analyses: {
          where: {
            jobId: req.params.jobId,
            userId,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates for job:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Delete candidate (user-specific)
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user!.userId;
    
    const candidate = await prisma.candidate.findFirst({
      where: { 
        id: req.params.id,
        userId 
      },
    });
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    await prisma.candidate.delete({
      where: { id: req.params.id },
    });
    
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

export default router; 