import { Router } from 'express';
import { upload } from '../utils/upload';
import { parseDocument, cleanText } from '../utils/fileParser';
import { analyzeJobDescription } from '../utils/ai-service';
import { prisma } from '../utils/prisma';
import { deleteUploadedFile } from '../utils/upload';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Upload and analyze job description
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
    const analysis = await analyzeJobDescription(cleanedText);
    
    // Save to database
    const jobDescription = await prisma.jobDescription.create({
      data: {
        userId,
        title: analysis.title,
        company: analysis.company,
        fileUrl: filePath,
        parsedText: cleanedText,
        skills: {
          required: analysis.requiredSkills,
          niceToHave: analysis.niceToHaveSkills || [],
        },
      },
    });
    
    res.json({
      id: jobDescription.id,
      title: jobDescription.title,
      company: jobDescription.company,
      skills: jobDescription.skills,
      experienceLevel: analysis.experienceLevel,
    });
  } catch (error) {
    console.error('Error processing job description:', error);
    res.status(500).json({ error: 'Failed to process job description' });
  } finally {
    // Clean up uploaded file if needed
    if (filePath && process.env.NODE_ENV === 'production') {
      await deleteUploadedFile(filePath);
    }
  }
});

// Get all job descriptions for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.userId;
    
    const jobs = await prisma.jobDescription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        company: true,
        skills: true,
        createdAt: true,
      },
    });
    
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching job descriptions:', error);
    res.status(500).json({ error: 'Failed to fetch job descriptions' });
  }
});

// Get single job description (user-specific)
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user!.userId;
    
    const job = await prisma.jobDescription.findFirst({
      where: { 
        id: req.params.id,
        userId 
      },
      include: {
        analyses: {
          include: {
            candidate: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job description not found' });
    }
    
    res.json(job);
  } catch (error) {
    console.error('Error fetching job description:', error);
    res.status(500).json({ error: 'Failed to fetch job description' });
  }
});

// Delete job description (user-specific)
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user!.userId;
    
    const job = await prisma.jobDescription.findFirst({
      where: { 
        id: req.params.id,
        userId 
      },
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job description not found' });
    }
    
    await prisma.jobDescription.delete({
      where: { id: req.params.id },
    });
    
    res.json({ message: 'Job description deleted successfully' });
  } catch (error) {
    console.error('Error deleting job description:', error);
    res.status(500).json({ error: 'Failed to delete job description' });
  }
});

export default router; 