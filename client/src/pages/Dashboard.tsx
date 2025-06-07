import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FileText, Users, TrendingUp, ArrowRight, Loader2, Zap } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import { jobDescriptionApi, candidateApi, analysisApi } from '../services/api';
import { JobDescription, Candidate, Analysis } from '../types';

function Dashboard() {
  const queryClient = useQueryClient();
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
      window.location.href = `/analysis/${data.candidateId}/${data.jobId}`;
    },
  });

  const handleAnalyze = () => {
    if (selectedJob && selectedCandidate) {
      analyzeMutation.mutate({ candidateId: selectedCandidate, jobId: selectedJob });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Upload job descriptions and resumes to start matching candidates
        </p>
      </div>

      {/* Quick Match Banner - Shows when both items are recently uploaded */}
      {recentJobUpload && recentCandidateUpload && (
        <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-primary-900 flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Ready to Match!
              </h3>
              <p className="text-primary-700 mt-1">
                You've uploaded both a job description and a resume. Run the analysis now!
              </p>
            </div>
            <button
              onClick={() => analyzeMutation.mutate({ 
                candidateId: recentCandidateUpload, 
                jobId: recentJobUpload 
              })}
              disabled={analyzeMutation.isPending}
              className="btn-primary flex items-center"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Run Match Analysis
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Job Descriptions</p>
              <p className="text-2xl font-semibold text-gray-900">{jobs.length}</p>
            </div>
            <FileText className="h-8 w-8 text-primary-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Candidates</p>
              <p className="text-2xl font-semibold text-gray-900">{candidates.length}</p>
            </div>
            <Users className="h-8 w-8 text-primary-500" />
          </div>
        </div>
        <div className="card">
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Job Description</h2>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Resume</h2>
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

      {/* Quick Match Section */}
      {jobs.length > 0 && candidates.length > 0 && (
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
      {analyses.length > 0 && (
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