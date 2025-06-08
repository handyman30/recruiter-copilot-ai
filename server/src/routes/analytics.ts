import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Analytics event interface
interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

// Store analytics events
router.post('/', async (req, res) => {
  try {
    const event: AnalyticsEvent = req.body;
    
    // Log analytics to console for now (you can integrate with analytics services)
    console.log('📊 Analytics Event:', {
      name: event.name,
      sessionId: event.sessionId,
      userId: event.userId,
      timestamp: new Date(event.timestamp).toISOString(),
      properties: event.properties
    });

    // Store in database for analysis
    // Note: You'd need to create an Analytics table in Prisma schema
    // For now, we'll just acknowledge receipt
    
    res.json({ success: true, eventId: `event_${Date.now()}` });
  } catch (error) {
    console.error('Analytics error:', error);
    res.json({ success: false }); // Don't fail the user experience
  }
});

// Get analytics dashboard data (protected route for admin)
router.get('/dashboard', async (req, res) => {
  try {
    // This would normally be protected by admin auth
    // For now, return mock analytics data
    
    const analyticsData = {
      totalUsers: 1247,
      dailyActiveUsers: 89,
      conversionRate: 12.3,
      topFeatures: [
        { feature: 'file_upload', usage: 2341 },
        { feature: 'ai_analysis', usage: 1876 },
        { feature: 'demo_mode', usage: 987 },
        { feature: 'signup', usage: 156 }
      ],
      conversionFunnel: [
        { step: 'landing_page', users: 1247 },
        { step: 'demo_start', users: 987 },
        { step: 'file_upload', users: 743 },
        { step: 'analysis_run', users: 524 },
        { step: 'signup_intent', users: 298 },
        { step: 'signup_complete', users: 156 }
      ],
      userJourney: {
        averageTimeToSignup: '18 minutes',
        mostCommonPath: 'demo → upload → analysis → signup',
        dropoffPoints: ['exit_intent', 'file_upload_failure', 'analysis_error']
      }
    };
    
    res.json(analyticsData);
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Track specific conversion events
router.post('/conversion', async (req, res) => {
  try {
    const { type, userId, sessionId, properties } = req.body;
    
    console.log('🎯 Conversion Event:', {
      type,
      userId,
      sessionId,
      timestamp: new Date().toISOString(),
      properties
    });
    
    // Here you could trigger webhooks, send to analytics services, etc.
    
    res.json({ success: true });
  } catch (error) {
    console.error('Conversion tracking error:', error);
    res.json({ success: false });
  }
});

// Track feature usage
router.post('/feature', async (req, res) => {
  try {
    const { feature, userId, sessionId, details } = req.body;
    
    console.log('⚡ Feature Usage:', {
      feature,
      userId,
      sessionId,
      timestamp: new Date().toISOString(),
      details
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Feature tracking error:', error);
    res.json({ success: false });
  }
});

// Get popular features
router.get('/features/popular', async (req, res) => {
  try {
    // Mock data for now - this would come from your analytics database
    const popularFeatures = [
      { name: 'AI Analysis', usage: 1876, trend: '+23%' },
      { name: 'File Upload', usage: 2341, trend: '+18%' },
      { name: 'Demo Mode', usage: 987, trend: '+45%' },
      { name: 'Match Scoring', usage: 1654, trend: '+12%' },
      { name: 'Skills Analysis', usage: 1432, trend: '+8%' }
    ];
    
    res.json(popularFeatures);
  } catch (error) {
    console.error('Popular features error:', error);
    res.status(500).json({ error: 'Failed to fetch popular features' });
  }
});

export default router; 