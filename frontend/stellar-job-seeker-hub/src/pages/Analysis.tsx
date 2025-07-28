
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Mail, FileText, Loader2 } from 'lucide-react';
import { fetchAnalytics } from '@/lib/api';

interface AnalyticsData {
  totalApplications: number;
  coldEmailsSent: number;
  platformBreakdown: Array<{ platform: string; applications: number; coldEmails: number; }>;
  monthlyStats: Array<{ month: string; applications: number; emails: number; }>;
}

const COLORS = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-3 text-sm">
        <p className="label text-white font-bold">{`${label}`}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} style={{ color: pld.color }}>{`${pld.name}: ${pld.value}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

const Analysis = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const analyticsData = await fetchAnalytics();
        setData({
          totalApplications: analyticsData.total_applications || 0,
          coldEmailsSent: analyticsData.cold_emails_sent || 0,
          platformBreakdown: analyticsData.platform_breakdown || [],
          monthlyStats: analyticsData.monthly_stats || [],
        });
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError("Failed to load analytics data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 text-stellar-purple animate-spin" />
          <span className="text-white text-lg">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-red-500 mb-4">An Error Occurred</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.totalApplications === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-4">No Data Available</h1>
          <p className="text-gray-400">Start applying to jobs to see your analytics!</p>
        </div>
      </div>
    );
  }

  const responseRate = data.totalApplications > 0 ? Math.round((data.coldEmailsSent / data.totalApplications) * 100) : 0;
  const platformBreakdown = data.platformBreakdown || [];
  const monthlyStats = data.monthlyStats || [];

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-stellar-purple to-stellar-cyan bg-clip-text text-transparent">
            Job Search Analytics
          </h1>
          <p className="text-gray-300 text-md sm:text-lg">
            Track your progress and optimize your job search strategy.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard icon={FileText} title="Total Applications" value={data.totalApplications} color="purple" />
          <StatCard icon={Mail} title="Cold Emails Sent" value={data.coldEmailsSent} color="cyan" />
          <StatCard icon={TrendingUp} title="Response Rate" value={`${responseRate}%`} color="green" />
          <StatCard icon={Users} title="Active Platforms" value={platformBreakdown.length} color="yellow" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
          {/* Monthly Trends */}
          <div className="glass rounded-2xl p-6 lg:col-span-3">
            <h3 className="text-xl font-bold text-white mb-6">Monthly Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="applications" fill="#6366F1" name="Applications" radius={[4, 4, 0, 0]} />
                <Bar dataKey="emails" fill="#06B6D4" name="Cold Emails" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Breakdown */}
          <div className="glass rounded-2xl p-6 lg:col-span-2">
            <h3 className="text-xl font-bold text-white mb-6">Platform Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platformBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="applications"
                  paddingAngle={5}
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                    return (
                      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {platformBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Details */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Platform Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Platform</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Applications</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Cold Emails</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {platformBreakdown.map((platform, index) => {
                  const efficiency = data.totalApplications > 0 ? (platform.applications / data.totalApplications) * 100 : 0;
                  return (
                    <tr key={platform.platform} className="border-b border-gray-800 hover:bg-stellar-navy/20">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="text-white font-medium">{platform.platform}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white">{platform.applications}</td>
                      <td className="py-4 px-4 text-white">{platform.coldEmails}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="h-2.5 rounded-full" style={{ width: `${efficiency}%`, backgroundColor: COLORS[index % COLORS.length] }}></div>
                          </div>
                          <span className="text-gray-400 text-xs font-medium">{Math.round(efficiency)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, color }: { icon: React.ElementType, title: string, value: string | number, color: string }) => {
  const colorClasses = {
    purple: { bg: 'bg-stellar-purple/20', text: 'text-stellar-purple' },
    cyan: { bg: 'bg-stellar-cyan/20', text: 'text-stellar-cyan' },
    green: { bg: 'bg-green-500/20', text: 'text-green-500' },
    yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-500' },
  };
  const { bg, text } = colorClasses[color as keyof typeof colorClasses] || colorClasses.purple;

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`w-12 h-12 ${bg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${text}`} />
        </div>
      </div>
    </div>
  );
}

export default Analysis;
