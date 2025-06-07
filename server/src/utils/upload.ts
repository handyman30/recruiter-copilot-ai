import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${crypto.randomUUID()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Please upload PDF or DOCX files.'));
  }
};

// Create multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Helper to delete uploaded files
export async function deleteUploadedFile(filePath: string): Promise<void> {
  const fs = await import('fs/promises');
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
} 