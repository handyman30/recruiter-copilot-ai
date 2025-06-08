import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Copy, Loader2, ArrowLeft, Home } from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { useAuth } from '../contexts/AuthContext';
import { analysisApi } from '../services/api';

function Analysis() {
  const { candidateId, jobId } = useParams<{ candidateId: string; jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get analysis data - from API if logged in, from localStorage if demo
  const { data: analysis, isLoading } = useQuery({
    queryKey: ['analysis', candidateId, jobId],
    queryFn: async () => {
      if (!user) {
        // Demo mode - get from session-specific localStorage
        const getSessionId = () => {
          let sessionId = sessionStorage.getItem('recruiter_session_id');
          if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('recruiter_session_id', sessionId);
          }
          return sessionId;
        };
        
        const getSessionStorageKey = () => {
          return `demo_recruiter_data_${getSessionId()}`;
        };
        
        const demoData = JSON.parse(localStorage.getItem(getSessionStorageKey()) || '{}');
        const analyses = demoData.analyses || [];
        const analysis = analyses.find((a: any) => 
          a.candidateId === candidateId && a.jobId === jobId
        );
        
        if (!analysis) {
          throw new Error('Analysis not found in demo data');
        }
        
        // Add demo candidate and job data
        const demoJobs = demoData.jobs || [];
        const demoCandidates = demoData.candidates || [];
        
        return {
          ...analysis,
          candidate: demoCandidates.find((c: any) => c.id === candidateId) || {
            id: candidateId,
            name: 'Demo Candidate',
            email: 'demo@example.com',
            phone: '+1 (555) 123-4567',
            location: 'San Francisco, CA'
          },
          job: demoJobs.find((j: any) => j.id === jobId) || {
            id: jobId,
            title: 'Demo Job Position',
            company: 'Demo Company',
            location: 'Remote'
          }
        };
      }
      
      // Authenticated mode - use API
      return analysisApi.get(candidateId!, jobId!);
    },
    enabled: !!candidateId && !!jobId,
  });

  // Track page view
  React.useEffect(() => {
    if (analysis) {
      trackEvent('analysis_page_viewed', {
        candidateId,
        jobId,
        matchPercentage: analysis.matchPercentage,
        mode: user ? 'authenticated' : 'demo'
      });
    }
  }, [analysis, candidateId, jobId, user]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
      </div>
    );
  }

  if (!analysis) {
    return <div>Analysis not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Match Analysis</h1>
          <p className="mt-2 text-gray-600">
            {analysis.candidate?.name} → {analysis.job?.title}
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-secondary flex items-center"
        >
          <Home className="h-4 w-4 mr-2" />
          Dashboard
        </button>
      </div>

      {/* Match Score */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Match Score</h2>
            <p className="text-sm text-gray-600 mt-1">
              Based on skills, experience, and requirements
            </p>
          </div>
          <div className={`text-5xl font-bold ${
            analysis.matchPercentage >= 80 ? 'text-green-600' :
            analysis.matchPercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {analysis.matchPercentage}%
          </div>
        </div>
      </div>

      {/* Skills Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Matching Skills</h3>
          <div className="space-y-2">
            {analysis.topSkills.map((skill: string, index: number) => (
              <div key={index} className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">{skill}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Missing Skills</h3>
          <div className="space-y-2">
            {analysis.missingSkills.length > 0 ? (
              analysis.missingSkills.map((skill: string, index: number) => (
                <div key={index} className="flex items-center">
                  <span className="text-red-500 mr-2">×</span>
                  <span className="text-gray-700">{skill}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No critical skills missing!</p>
            )}
          </div>
        </div>
      </div>

      {/* Follow-up Message */}
      {analysis.generatedMessage && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Follow-up Message</h3>
            <button
              onClick={() => copyToClipboard(analysis.generatedMessage!)}
              className="btn-secondary text-sm"
            >
              <Copy className="h-4 w-4 mr-1 inline" />
              Copy
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{analysis.generatedMessage}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 pt-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary px-8 py-3 text-lg"
        >
          <Home className="h-5 w-5 mr-2 inline" />
          Back to Dashboard
        </button>
        <button
          onClick={() => navigate('/candidates')}
          className="btn-secondary px-8 py-3 text-lg"
        >
          View All Candidates
        </button>
      </div>
    </div>
  );
}

export default Analysis; 