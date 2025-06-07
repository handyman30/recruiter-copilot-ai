import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Copy, RefreshCw, Loader2 } from 'lucide-react';
import { analysisApi } from '../services/api';

function Analysis() {
  const { candidateId, jobId } = useParams<{ candidateId: string; jobId: string }>();
  
  const { data: analysis, isLoading } = useQuery({
    queryKey: ['analysis', candidateId, jobId],
    queryFn: () => analysisApi.get(candidateId!, jobId!),
    enabled: !!candidateId && !!jobId,
  });

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Match Analysis</h1>
        <p className="mt-2 text-gray-600">
          {analysis.candidate?.name} → {analysis.job?.title}
        </p>
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
            {analysis.topSkills.map((skill, index) => (
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
              analysis.missingSkills.map((skill, index) => (
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
    </div>
  );
}

export default Analysis; 