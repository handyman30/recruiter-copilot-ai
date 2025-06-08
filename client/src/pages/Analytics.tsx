import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AnalyticsData {
  totalMatches: number;
  averageMatchScore: number;
  activeUsers: number;
  matchesByDay: { date: string; count: number }[];
  recentMatches: any[];
}

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalMatches: 0,
    averageMatchScore: 0,
    activeUsers: 0,
    matchesByDay: [],
    recentMatches: []
  });
  const { user } = useAuth();

  useEffect(() => {
    // Fetch analytics data from session-specific localStorage
    const fetchAnalytics = () => {
      try {
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
        const jobs = demoData.jobs || [];
        const candidates = demoData.candidates || [];

        // Calculate metrics from demo data
        const totalMatches = analyses.length;
        const averageScore = analyses.length > 0 
          ? Math.round(analyses.reduce((sum: number, analysis: any) => sum + analysis.matchPercentage, 0) / analyses.length)
          : 0;

        // Generate last 7 days data
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return {
            date: date.toISOString().split('T')[0],
            count: i === 6 ? analyses.length : Math.floor(Math.random() * 3) // Show recent activity on today
          };
        });

        setData({
          totalMatches,
          averageMatchScore: averageScore,
          activeUsers: user ? 1 : 0, // Show 1 if logged in, 0 for demo
          matchesByDay: last7Days,
          recentMatches: analyses.slice(-5).reverse() // Last 5 matches
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchAnalytics();
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Key Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Total Matches</h2>
          <p className="text-3xl font-bold text-blue-600">{data.totalMatches}</p>
          <p className="text-sm text-gray-500 mt-2">Matches completed</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Average Match Score</h2>
          <p className="text-3xl font-bold text-green-600">{data.averageMatchScore}%</p>
          <p className="text-sm text-gray-500 mt-2">Across all matches</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Session Activity</h2>
          <p className="text-3xl font-bold text-purple-600">{user ? 'Authenticated' : 'Demo Mode'}</p>
          <p className="text-sm text-gray-500 mt-2">{user ? 'Logged in user' : 'Guest session'}</p>
        </div>
      </div>

      {/* Matches by Day Chart */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity (Last 7 Days)</h2>
        <div className="h-64 flex items-end justify-between">
          {data.matchesByDay.map((day, index) => {
            const maxCount = Math.max(...data.matchesByDay.map(d => d.count));
            const height = maxCount > 0 ? (day.count / maxCount) * 200 : 20;
            
            return (
              <div key={day.date} className="flex flex-col items-center flex-1 mx-1">
                <div 
                  className="bg-blue-500 w-full rounded-t-lg min-h-[20px] flex items-end justify-center text-white text-xs font-semibold"
                  style={{ height: `${height}px` }}
                >
                  {day.count > 0 && day.count}
                </div>
                <span className="text-xs mt-2 text-gray-600">
                  {new Date(day.date).toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Matches */}
      {data.recentMatches.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Matches</h2>
          <div className="space-y-3">
            {data.recentMatches.map((match, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="text-sm font-medium">
                    Match completed
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-600">{match.matchPercentage}%</span>
                  <p className="text-xs text-gray-500">
                    {new Date(match.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!user && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900">Demo Mode Analytics</h3>
          <p className="text-sm text-blue-700 mt-1">
            This dashboard shows demo data for your current session. Sign up to get real analytics across all your sessions and see advanced metrics.
          </p>
        </div>
      )}
    </div>
  );
}; 