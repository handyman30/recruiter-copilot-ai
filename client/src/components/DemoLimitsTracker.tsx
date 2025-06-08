import { useState, useEffect } from 'react';
import { AlertTriangle, Zap, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getDemoLimitsInfo } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

function DemoLimitsTracker() {
  const { user } = useAuth();
  const [limits, setLimits] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Don't show for authenticated users
  if (user) return null;

  useEffect(() => {
    const updateLimits = () => {
      const limitsInfo = getDemoLimitsInfo();
      setLimits(limitsInfo);
      
      // Format time remaining
      const timeLeft = limitsInfo.sessionTimeRemaining();
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`${hours}h ${minutes}m`);
    };

    updateLimits();
    const interval = setInterval(updateLimits, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (!limits) return null;

  const analysesAtLimit = limits.analyses.remaining === 0;
  const jobsAtLimit = limits.jobs.remaining === 0;
  const candidatesAtLimit = limits.candidates.remaining === 0;
  const anyAtLimit = analysesAtLimit || jobsAtLimit || candidatesAtLimit;

  return (
    <div className={`rounded-xl p-6 border-2 ${
      anyAtLimit 
        ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200' 
        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            {anyAtLimit ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : (
              <Zap className="h-5 w-5 text-blue-500" />
            )}
            <h3 className={`font-semibold ${anyAtLimit ? 'text-red-900' : 'text-blue-900'}`}>
              {anyAtLimit ? 'Demo Limits Reached!' : 'Demo Usage'}
            </h3>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              {timeRemaining} remaining
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Analyses */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                analysesAtLimit ? 'text-red-600' : 
                limits.analyses.remaining <= 1 ? 'text-orange-600' : 'text-blue-600'
              }`}>
                {limits.analyses.used}/{limits.analyses.max}
              </div>
              <div className="text-sm text-gray-600">AI Analyses</div>
              {analysesAtLimit && (
                <div className="text-xs text-red-500 font-medium mt-1">Limit Reached!</div>
              )}
            </div>

            {/* Jobs */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                jobsAtLimit ? 'text-red-600' : 
                limits.jobs.remaining <= 0 ? 'text-orange-600' : 'text-blue-600'
              }`}>
                {limits.jobs.used}/{limits.jobs.max}
              </div>
              <div className="text-sm text-gray-600">Job Posts</div>
              {jobsAtLimit && (
                <div className="text-xs text-red-500 font-medium mt-1">Limit Reached!</div>
              )}
            </div>

            {/* Candidates */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                candidatesAtLimit ? 'text-red-600' : 
                limits.candidates.remaining <= 0 ? 'text-orange-600' : 'text-blue-600'
              }`}>
                {limits.candidates.used}/{limits.candidates.max}
              </div>
              <div className="text-sm text-gray-600">Candidates</div>
              {candidatesAtLimit && (
                <div className="text-xs text-red-500 font-medium mt-1">Limit Reached!</div>
              )}
            </div>
          </div>

          {anyAtLimit ? (
            <div className="space-y-3">
              <p className="text-red-700 text-sm">
                You've reached your demo limits! Upgrade to Pro for unlimited access to all features.
              </p>
              <div className="flex items-center space-x-4">
                <Link
                  to="/pricing"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
                <button
                  onClick={() => {
                    // Clear demo data to reset limits (but keep showing message)
                    const sessionId = sessionStorage.getItem('recruiter_session_id');
                    if (sessionId) {
                      localStorage.removeItem(`demo_recruiter_data_${sessionId}`);
                      sessionStorage.removeItem('demo_session_start');
                      window.location.reload();
                    }
                  }}
                  className="text-sm text-red-600 hover:text-red-700 underline"
                >
                  Reset Demo (lose all data)
                </button>
              </div>
            </div>
          ) : (
            <p className="text-blue-700 text-sm">
              Try our AI-powered matching! Upgrade anytime for unlimited access.
            </p>
          )}
        </div>

        {!anyAtLimit && (
          <Link
            to="/pricing"
            className="btn-primary text-sm ml-4 flex items-center"
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Upgrade
          </Link>
        )}
      </div>
    </div>
  );
}

export default DemoLimitsTracker; 