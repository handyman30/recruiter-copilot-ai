import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { trackEvent, trackSignupIntent, trackConversion } from './utils/analytics';
import Layout from './components/Layout';
import AuthForm from './components/AuthForm';
import GuidedTour from './components/GuidedTour';
import Dashboard from './pages/Dashboard';
import JobDescriptions from './pages/JobDescriptions';
import Candidates from './pages/Candidates';
import Analysis from './pages/Analysis';
import { AnalyticsDashboard } from './pages/Analytics';
import PricingPage from './pages/Pricing';

function DemoBanner({ onSignUp }: { onSignUp: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-primary-600 to-blue-600 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5" />
          <span className="font-medium">You're trying RecruiterCopilot.ai!</span>
          <span className="text-primary-100">Sign up to save your analyses and manage multiple jobs.</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              trackSignupIntent('save_button');
              onSignUp();
            }}
            className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors flex items-center space-x-1"
          >
            <span>Save My Work</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              trackEvent('demo_banner_dismissed');
              setIsVisible(false);
            }}
            className="text-primary-100 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

// Exit intent detection for signup prompt
function useExitIntent(onExitIntent: () => void) {
  useEffect(() => {
    let timeoutId: number;
    
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        trackSignupIntent('exit_intent');
        onExitIntent();
      }
    };
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasData = localStorage.getItem('demo_recruiter_data');
      if (hasData) {
        e.preventDefault();
        e.returnValue = 'You have unsaved work. Sign up to keep your analyses!';
        trackSignupIntent('page_exit');
        onExitIntent();
      }
    };

    // Show signup after 3 minutes of activity
    timeoutId = window.setTimeout(() => {
      trackSignupIntent('timer');
      onExitIntent();
    }, 3 * 60 * 1000);

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearTimeout(timeoutId);
    };
  }, [onExitIntent]);
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showExitPrompt, setShowExitPrompt] = useState(false);

  // Exit intent detection
  useExitIntent(() => {
    if (!user && !showExitPrompt) {
      setShowExitPrompt(true);
    }
  });

  // Show tour on first visit
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('recruiter_tour_completed');
    if (!hasSeenTour && !user) {
      trackEvent('first_visit');
      setShowTour(true);
    }
  }, [user]);

  // Track user login
  useEffect(() => {
    if (user) {
      trackConversion('login');
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-primary-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth form only when explicitly requested
  if (showAuth) {
    return (
      <AuthForm 
        onSuccess={() => {
          trackConversion('signup');
          setShowAuth(false);
          setShowExitPrompt(false);
        }}
        onDemoMode={() => {
          trackEvent('continue_demo');
          setShowAuth(false);
        }}
      />
    );
  }

  // Exit intent signup prompt
  if (showExitPrompt && !user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-scale-up">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Love what you see?
          </h2>
          <p className="text-gray-600 mb-6">
            Sign up now to save your analyses, manage multiple jobs, and access advanced features!
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                trackEvent('exit_prompt_signup');
                setShowAuth(true);
              }}
              className="w-full btn-primary py-3 text-lg"
            >
              Yes, Save My Work!
            </button>
            <button
              onClick={() => {
                trackEvent('exit_prompt_continue');
                setShowExitPrompt(false);
              }}
              className="w-full btn-secondary py-3"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main app content - always accessible
  return (
    <div>
      {/* Guided Tour */}
      {showTour && (
        <GuidedTour
          onComplete={() => {
            trackEvent('tour_completed');
            setShowTour(false);
          }}
          onSkip={() => {
            trackEvent('tour_skipped');
            setShowTour(false);
          }}
        />
      )}

      {/* Show demo banner if not logged in */}
      {!user && (
        <DemoBanner onSignUp={() => setShowAuth(true)} />
      )}
      
      <RouterProvider router={createBrowserRouter([
        {
          path: '/',
          element: <Navigate to="/dashboard" replace />
        },
        {
          path: '/auth',
          element: <AuthForm />
        },
        {
          path: '/pricing',
          element: <PricingPage />
        },
        {
          path: '/',
          element: <Layout />,
          children: [
            {
              path: 'dashboard',
              element: <Dashboard />
            },
            {
              path: 'jobs',
              element: <JobDescriptions />
            },
            {
              path: 'candidates',
              element: <Candidates />
            },
            {
              path: 'analytics',
              element: <AnalyticsDashboard />
            },
            {
              path: 'analysis/:candidateId/:jobId',
              element: <Analysis />
            }
          ]
        }
      ])} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App; 