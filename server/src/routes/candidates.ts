import { Router } from 'express';
import { upload } from '../utils/upload';
import { parseDocument, cleanText } from '../utils/fileParser';
import { analyzeResume } from '../utils/ai-service';
import { prisma } from '../utils/prisma';
import { deleteUploadedFile } from '../utils/upload';

const router = Router();

// Upload and analyze candidate resume
router.post('/', upload.single('file'), async (req, res) => {
  let filePath: string | undefined;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    filePath = req.file.path;
    
    // Parse document
    const rawText = await parseDocument(filePath, req.file.mimetype);
    const cleanedText = cleanText(rawText);
    
    // Analyze with OpenAI
    const analysis = await analyzeResume(cleanedText);
    
    // Save to database
    const candidate = await prisma.candidate.create({
      data: {
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

// Get all candidates
router.get('/', async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
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

// Get single candidate with analyses
router.get('/:id', async (req, res) => {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: req.params.id },
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

// Get candidates for a specific job
router.get('/for-job/:jobId', async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      where: {
        analyses: {
          some: {
            jobId: req.params.jobId,
          },
        },
      },
      include: {
        analyses: {
          where: {
            jobId: req.params.jobId,
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

// Delete candidate
router.delete('/:id', async (req, res) => {
  try {
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