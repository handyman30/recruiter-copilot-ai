import { Routes, Route, Navigate } from 'react-router-dom';
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
import LandingPage from './pages/LandingPage';

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
    
    // Check if we've already shown the prompt in this session
    const hasShownExitPrompt = sessionStorage.getItem('exit_prompt_shown');
    if (hasShownExitPrompt) {
      return; // Don't set up any handlers if already shown
    }
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasData = localStorage.getItem('demo_recruiter_data');
      if (hasData && !sessionStorage.getItem('exit_prompt_shown')) {
        sessionStorage.setItem('exit_prompt_shown', 'true');
        e.preventDefault();
        e.returnValue = 'You have unsaved work. Sign up to keep your analyses!';
        trackSignupIntent('page_exit');
        onExitIntent();
      }
    };

    // Show signup after 10 minutes of activity (instead of 3)
    timeoutId = window.setTimeout(() => {
      if (!sessionStorage.getItem('exit_prompt_shown')) {
        sessionStorage.setItem('exit_prompt_shown', 'true');
        trackSignupIntent('timer');
        onExitIntent();
      }
    }, 10 * 60 * 1000); // 10 minutes instead of 3

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
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

  // Exit intent detection - only if user is not logged in and hasn't seen prompt
  useExitIntent(() => {
    if (!user && !showExitPrompt && !sessionStorage.getItem('exit_prompt_shown')) {
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
                sessionStorage.setItem('exit_prompt_shown', 'true');
                setShowAuth(true);
              }}
              className="w-full btn-primary py-3 text-lg"
            >
              Yes, Save My Work!
            </button>
            <button
              onClick={() => {
                trackEvent('exit_prompt_continue');
                sessionStorage.setItem('exit_prompt_shown', 'true');
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
      
      <Routes>
        {/* Landing Page - SEO optimized home page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Standalone pages */}
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/pricing" element={<PricingPage />} />
        
        {/* App routes with Layout */}
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jobs" element={<JobDescriptions />} />
          <Route path="candidates" element={<Candidates />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="analysis/:candidateId/:jobId" element={<Analysis />} />
          
          {/* SEO Landing Pages for specific keywords */}
          <Route path="ai-resume-matching" element={<Navigate to="/dashboard" replace />} />
          <Route path="candidate-screening-ai" element={<Navigate to="/dashboard" replace />} />
          <Route path="recruitment-automation" element={<Navigate to="/dashboard" replace />} />
          <Route path="ats-software" element={<Navigate to="/dashboard" replace />} />
          <Route path="free-resume-scanner" element={<Navigate to="/dashboard" replace />} />
          
          {/* Future content pages */}
          <Route path="help" element={<Navigate to="/dashboard" replace />} />
          <Route path="faq" element={<Navigate to="/dashboard" replace />} />
          <Route path="how-it-works" element={<Navigate to="/dashboard" replace />} />
          <Route path="about" element={<Navigate to="/dashboard" replace />} />
          <Route path="contact" element={<Navigate to="/dashboard" replace />} />
          <Route path="privacy" element={<Navigate to="/dashboard" replace />} />
          <Route path="terms" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </div>
  );
}

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App; 