import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Zap, TrendingUp } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

interface UsageData {
  plan: string;
  dailyMatches: {
    used: number;
    limit: number;
    remaining: number;
  };
}

export const UsageTracker: React.FC = () => {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUsage();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/subscriptions/usage', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user || !usage) return null;

  // Don't show for unlimited users
  if (usage.dailyMatches.limit === -1) return null;

  const isNearLimit = usage.dailyMatches.remaining <= 1;
  const isAtLimit = usage.dailyMatches.remaining === 0;

  return (
    <div className={`card mb-6 ${isAtLimit ? 'border-red-200 bg-red-50' : isNearLimit ? 'border-yellow-200 bg-yellow-50' : 'border-blue-200 bg-blue-50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${isAtLimit ? 'bg-red-100' : isNearLimit ? 'bg-yellow-100' : 'bg-blue-100'}`}>
            <TrendingUp className={`h-5 w-5 ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-blue-600'}`} />
          </div>
          <div>
            <h3 className={`font-semibold ${isAtLimit ? 'text-red-900' : isNearLimit ? 'text-yellow-900' : 'text-blue-900'}`}>
              Daily Matches
            </h3>
            <p className={`text-sm ${isAtLimit ? 'text-red-700' : isNearLimit ? 'text-yellow-700' : 'text-blue-700'}`}>
              {usage.dailyMatches.used} of {usage.dailyMatches.limit} used today
            </p>
          </div>
        </div>
        
        {(isNearLimit || isAtLimit) && (
          <button
            onClick={() => {
              trackEvent('upgrade_prompt_clicked', { 
                source: 'usage_tracker',
                usage: usage.dailyMatches.used,
                limit: usage.dailyMatches.limit
              });
              window.location.href = '/pricing';
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Zap className="h-4 w-4" />
            <span>Upgrade to Pro</span>
          </button>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1">
          <span className={isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-blue-600'}>
            {usage.dailyMatches.remaining} matches remaining
          </span>
          <span className="text-gray-500">
            Resets at midnight
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
            style={{ 
              width: `${(usage.dailyMatches.used / usage.dailyMatches.limit) * 100}%` 
            }}
          />
        </div>
      </div>
      
      {isAtLimit && (
        <div className="mt-4 p-3 bg-red-100 rounded-lg">
          <p className="text-red-800 text-sm font-medium">
            🚫 Daily limit reached! Upgrade to Pro for unlimited matches.
          </p>
        </div>
      )}
    </div>
  );
};

export default UsageTracker; 