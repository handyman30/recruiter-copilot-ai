import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Users, TrendingUp, ArrowRight, Loader2, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import { jobDescriptionApi, candidateApi, analysisApi } from '../services/api';
import { JobDescription, Candidate, Analysis } from '../types';

function Dashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [recentJobUpload, setRecentJobUpload] = useState<string | null>(null);
  const [recentCandidateUpload, setRecentCandidateUpload] = useState<string | null>(null);

  // Queries
  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: jobDescriptionApi.getAll,
  });

  const { data: candidates = [] } = useQuery({
    queryKey: ['candidates'],
    queryFn: candidateApi.getAll,
  });

  const { data: analyses = [] } = useQuery({
    queryKey: ['analyses'],
    queryFn: analysisApi.getAll,
  });

  // Mutations
  const uploadJobMutation = useMutation({
    mutationFn: jobDescriptionApi.upload,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setRecentJobUpload(data.id);
      setSelectedJob(data.id);
    },
  });

  const uploadCandidateMutation = useMutation({
    mutationFn: candidateApi.upload,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      setRecentCandidateUpload(data.id);
      setSelectedCandidate(data.id);
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: ({ candidateId, jobId }: { candidateId: string; jobId: string }) =>
      analysisApi.analyze(candidateId, jobId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
      setSelectedJob('');
      setSelectedCandidate('');
      setRecentJobUpload(null);
      setRecentCandidateUpload(null);
      // Navigate to the analysis page
      navigate(`/analysis/${data.candidateId}/${data.jobId}`);
    },
  });

  const handleAnalyze = () => {
    if (selectedJob && selectedCandidate) {
      analyzeMutation.mutate({ candidateId: selectedCandidate, jobId: selectedJob });
    }
  };

  // Check completion status
  const hasJobs = jobs.length > 0;
  const hasCandidates = candidates.length > 0;
  const hasAnalyses = analyses.length > 0;
  const canAnalyze = hasJobs && hasCandidates;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Upload job descriptions and resumes to start matching candidates
        </p>
      </div>

      {/* Getting Started Banner - Shows when user has no data */}
      {!hasJobs && !hasCandidates && (
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200 rounded-xl p-8 text-center">
          <div className="max-w-md mx-auto">
            <Zap className="h-12 w-12 text-primary-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Welcome! Let's get started 🚀
            </h3>
            <p className="text-gray-600 mb-6">
              Upload a job description and candidate resume to see the magic of AI-powered matching!
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center text-gray-500">
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center mr-2">
                  1
                </div>
                Upload Job
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <div className="flex items-center text-gray-500">
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center mr-2">
                  2
                </div>
                Upload Resume
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <div className="flex items-center text-gray-500">
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center mr-2">
                  3
                </div>
                Get Analysis
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Banner - Shows when partially complete */}
      {(hasJobs || hasCandidates) && !canAnalyze && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <AlertCircle className="h-6 w-6 text-amber-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-900">
                Almost there! 
              </h3>
              <p className="text-amber-700 mt-1">
                {!hasJobs && "Upload a job description to continue."}
                {!hasCandidates && "Upload a candidate resume to continue."}
              </p>
              <div className="flex items-center mt-3 space-x-4">
                <div className={`flex items-center ${hasJobs ? 'text-green-600' : 'text-gray-400'}`}>
                  {hasJobs ? <CheckCircle2 className="h-4 w-4 mr-1" /> : <div className="w-4 h-4 rounded-full border-2 border-current mr-1"></div>}
                  Job Description
                </div>
                <div className={`flex items-center ${hasCandidates ? 'text-green-600' : 'text-gray-400'}`}>
                  {hasCandidates ? <CheckCircle2 className="h-4 w-4 mr-1" /> : <div className="w-4 h-4 rounded-full border-2 border-current mr-1"></div>}
                  Candidate Resume
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ready to Match Banner - Prominent placement at top */}
      {canAnalyze && (selectedJob && selectedCandidate || recentJobUpload && recentCandidateUpload) && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8 text-center">
          <Zap className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-900 mb-2">
            Ready to Run Analysis! 🎯
          </h3>
          <p className="text-green-700 mb-6 max-w-md mx-auto">
            Perfect! You've uploaded both a job description and a candidate resume. 
            Let's see how well they match!
          </p>
          <button
            onClick={() => {
              const candidateId = selectedCandidate || recentCandidateUpload;
              const jobId = selectedJob || recentJobUpload;
              if (candidateId && jobId) {
                analyzeMutation.mutate({ candidateId, jobId });
              }
            }}
            disabled={analyzeMutation.isPending}
            className="inline-flex items-center px-8 py-4 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="animate-spin h-6 w-6 mr-3" />
                Analyzing Match...
              </>
            ) : (
              <>
                <Zap className="h-6 w-6 mr-3" />
                Run AI Analysis
              </>
            )}
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="card cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/jobs')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Job Descriptions</p>
              <p className="text-2xl font-semibold text-gray-900">{jobs.length}</p>
            </div>
            <FileText className="h-8 w-8 text-primary-500" />
          </div>
        </div>
        <div 
          className="card cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/candidates')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Candidates</p>
              <p className="text-2xl font-semibold text-gray-900">{candidates.length}</p>
            </div>
            <Users className="h-8 w-8 text-primary-500" />
          </div>
        </div>
        <div 
          className="card cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/candidates')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Analyses</p>
              <p className="text-2xl font-semibold text-gray-900">{analyses.length}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary-500" />
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upload Job Description</h2>
            {hasJobs && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          </div>
          <FileUpload
            onFileSelect={(file) => uploadJobMutation.mutate(file)}
            label="Upload Job Description"
            description="PDF or DOCX file containing the job requirements"
          />
          {uploadJobMutation.isPending && (
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Processing job description...
            </div>
          )}
          {uploadJobMutation.isSuccess && (
            <div className="mt-4 text-sm text-green-600">
              ✓ Job description uploaded successfully!
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upload Resume</h2>
            {hasCandidates && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          </div>
          <FileUpload
            onFileSelect={(file) => uploadCandidateMutation.mutate(file)}
            label="Upload Resume"
            description="PDF or DOCX file containing the candidate's resume"
          />
          {uploadCandidateMutation.isPending && (
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Processing resume...
            </div>
          )}
          {uploadCandidateMutation.isSuccess && (
            <div className="mt-4 text-sm text-green-600">
              ✓ Resume uploaded successfully!
            </div>
          )}
        </div>
      </div>

      {/* Manual Match Section - Only show if user has data but hasn't used auto-match */}
      {canAnalyze && !(selectedJob && selectedCandidate) && !(recentJobUpload && recentCandidateUpload) && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Match</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Job
              </label>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Choose a job...</option>
                {jobs.map((job: JobDescription) => (
                  <option key={job.id} value={job.id}>
                    {job.title} {job.company && `at ${job.company}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Candidate
              </label>
              <select
                value={selectedCandidate}
                onChange={(e) => setSelectedCandidate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Choose a candidate...</option>
                {candidates.map((candidate: Candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name} {candidate.location && `- ${candidate.location}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!selectedJob || !selectedCandidate || analyzeMutation.isPending}
            className="mt-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2 inline" />
                Analyzing...
              </>
            ) : (
              'Analyze Match'
            )}
          </button>
        </div>
      )}

      {/* Recent Analyses */}
      {hasAnalyses && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Analyses</h2>
            <Link to="/candidates" className="text-primary-600 hover:text-primary-700 text-sm">
              View all <ArrowRight className="inline h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {analyses.slice(0, 5).map((analysis: Analysis) => (
              <Link
                key={analysis.id}
                to={`/analysis/${analysis.candidateId}/${analysis.jobId}`}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {analysis.candidate?.name} → {analysis.job?.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Match: {analysis.matchPercentage}% • Top skills: {analysis.topSkills.join(', ')}
                    </p>
                  </div>
                  <div className={`text-2xl font-bold ${
                    analysis.matchPercentage >= 80 ? 'text-green-600' :
                    analysis.matchPercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {analysis.matchPercentage}%
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard; 