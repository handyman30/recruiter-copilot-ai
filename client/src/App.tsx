import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { useState } from 'react';
import Layout from './components/Layout';
import AuthForm from './components/AuthForm';
import GuidedTour from './components/GuidedTour';
import Dashboard from './pages/Dashboard';
import JobDescriptions from './pages/JobDescriptions';
import Candidates from './pages/Candidates';
import Analysis from './pages/Analysis';

function DemoBanner({ onSignUp }: { onSignUp: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-primary-600 to-blue-600 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5" />
          <span className="font-medium">You're in demo mode!</span>
          <span className="text-primary-100">Your work won't be saved.</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onSignUp}
            className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors flex items-center space-x-1"
          >
            <span>Sign Up to Save</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-primary-100 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showTour, setShowTour] = useState(false);

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

  // Show auth form if user wants to sign up from demo mode
  if (showAuth || (!user && !isDemoMode)) {
    return (
      <AuthForm 
        onSuccess={() => {
          setShowAuth(false);
          setShowTour(true); // Show tour for new users
        }}
        onDemoMode={() => {
          setIsDemoMode(true);
          setShowAuth(false);
          setShowTour(true); // Show tour for demo users too
        }}
      />
    );
  }

  // Main app content (for authenticated users OR demo mode)
  return (
    <div>
      {/* Guided Tour */}
      {showTour && (
        <GuidedTour
          onComplete={() => setShowTour(false)}
          onSkip={() => setShowTour(false)}
        />
      )}

      {/* Show demo banner if in demo mode */}
      {isDemoMode && !user && (
        <DemoBanner onSignUp={() => setShowAuth(true)} />
      )}
      
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jobs" element={<JobDescriptions />} />
          <Route path="candidates" element={<Candidates />} />
          <Route path="analysis/:candidateId/:jobId" element={<Analysis />} />
        </Route>
      </Routes>
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