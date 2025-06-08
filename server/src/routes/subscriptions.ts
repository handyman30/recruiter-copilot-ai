import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = Router();

// Simple server-side analytics tracking
const trackServerEvent = (event: string, data: any) => {
  console.log(`📊 Server Event: ${event}`, data);
};

// Activate subscription after PayPal approval
router.post('/activate', authMiddleware, async (req, res) => {
  try {
    const { subscription_id, plan } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify subscription with PayPal (you would implement this)
    // For now, we'll trust the frontend verification

    // Update user subscription status
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'ACTIVE',
        subscriptionPlan: plan,
        subscriptionId: subscription_id,
        subscriptionStartDate: new Date(),
      }
    });

    // Track subscription event
    trackServerEvent('subscription_activated', {
      userId,
      plan,
      subscription_id,
      amount: plan === 'pro_monthly' ? 10 : 0
    });

    res.json({ 
      success: true, 
      message: 'Subscription activated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan
      }
    });
  } catch (error) {
    console.error('Subscription activation error:', error);
    res.status(500).json({ error: 'Failed to activate subscription' });
  }
});

// Get subscription status
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        subscriptionPlan: true,
        subscriptionStartDate: true,
        subscriptionId: true
      }
    });

    res.json({
      subscriptionStatus: user?.subscriptionStatus || 'FREE',
      subscriptionPlan: user?.subscriptionPlan || 'free',
      subscriptionStartDate: user?.subscriptionStartDate,
      subscriptionId: user?.subscriptionId
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

// Cancel subscription
router.post('/cancel', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Update user subscription status
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'CANCELLED',
        // Keep the plan active until the end of the billing period
      }
    });

    // Track cancellation event
    trackServerEvent('subscription_cancelled', {
      userId,
      subscription_id: user.subscriptionId
    });

    res.json({ 
      success: true, 
      message: 'Subscription cancelled successfully' 
    });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Check usage limits for free users
router.get('/usage', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get user subscription status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        subscriptionPlan: true
      }
    });

    // If user is on a paid plan, return unlimited
    if (user?.subscriptionStatus === 'ACTIVE' && user.subscriptionPlan !== 'free') {
      return res.json({
        plan: user.subscriptionPlan,
        dailyMatches: {
          used: 0,
          limit: -1, // Unlimited
          remaining: -1
        }
      });
    }

    // For free users, check today's usage
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

    res.json({
      plan: 'free',
      dailyMatches: {
        used: todayAnalyses,
        limit: DAILY_FREE_LIMIT,
        remaining: Math.max(0, DAILY_FREE_LIMIT - todayAnalyses)
      }
    });
  } catch (error) {
    console.error('Usage check error:', error);
    res.status(500).json({ error: 'Failed to check usage' });
  }
});

export default router; 