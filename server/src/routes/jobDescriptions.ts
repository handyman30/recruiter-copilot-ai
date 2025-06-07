import { Router } from 'express';
import { upload } from '../utils/upload';
import { parseDocument, cleanText } from '../utils/fileParser';
import { analyzeJobDescription } from '../utils/ai-service';
import { prisma } from '../utils/prisma';
import { deleteUploadedFile } from '../utils/upload';

const router = Router();

// Upload and analyze job description
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
    const analysis = await analyzeJobDescription(cleanedText);
    
    // Save to database
    const jobDescription = await prisma.jobDescription.create({
      data: {
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

// Get all job descriptions
router.get('/', async (req, res) => {
  try {
    const jobs = await prisma.jobDescription.findMany({
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

// Get single job description
router.get('/:id', async (req, res) => {
  try {
    const job = await prisma.jobDescription.findUnique({
      where: { id: req.params.id },
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

// Delete job description
router.delete('/:id', async (req, res) => {
  try {
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