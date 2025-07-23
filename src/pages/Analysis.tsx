
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Mail, FileText, Loader } from 'lucide-react';
import { fetchAnalytics } from '@/lib/api';

interface AnalyticsData {
  totalApplications: number;
  coldEmailsSent: number;
  platformBreakdown: Array<{
    platform: string;
    applications: number;
    coldEmails: number;
  }>;
  monthlyStats: Array<{
    month: string;
    applications: number;
    emails: number;
  }>;
}

const Analysis = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        const analyticsData = await fetchAnalytics();
        console.log("Fetched analytics data:", analyticsData);
        setData(analyticsData as AnalyticsData);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        // Handle error appropriately in the UI
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const COLORS = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B'];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader className="w-8 h-8 text-stellar-purple animate-spin" />
          <span className="text-white text-lg">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">No Data Available</h1>
          <p className="text-gray-400">Start applying to jobs to see your analytics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-stellar-purple to-stellar-cyan bg-clip-text text-transparent">
            Job Search Analytics
          </h1>
          <p className="text-gray-300 text-lg">
            Track your progress and optimize your job search strategy
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Applications</p>
                <p className="text-3xl font-bold text-white">{data.totalApplications}</p>
              </div>
              <div className="w-12 h-12 bg-stellar-purple/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-stellar-purple" />
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Cold Emails Sent</p>
                <p className="text-3xl font-bold text-white">{data.coldEmailsSent}</p>
              </div>
              <div className="w-12 h-12 bg-stellar-cyan/20 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-stellar-cyan" />
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Response Rate</p>
                <p className="text-3xl font-bold text-white">24%</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Active Platforms</p>
                <p className="text-3xl font-bold text-white">{data.platformBreakdown.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Trends */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Monthly Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Bar dataKey="applications" fill="#6366F1" name="Applications" />
                <Bar dataKey="emails" fill="#06B6D4" name="Cold Emails" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Breakdown */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Platform Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.platformBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="applications"
                  label={({ platform, applications }) => `${platform}: ${applications}`}
                >
                  {data.platformBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Details */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Platform Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Platform</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Applications</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Cold Emails</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {data.platformBreakdown.map((platform, index) => (
                  <tr key={platform.platform} className="border-b border-gray-800">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-white font-medium">{platform.platform}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-white">{platform.applications}</td>
                    <td className="py-4 px-4 text-white">{platform.coldEmails}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-stellar-purple h-2 rounded-full" 
                            style={{ 
                              width: `${(platform.applications / data.totalApplications) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-gray-400 text-sm">
                          {Math.round((platform.applications / data.totalApplications) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
