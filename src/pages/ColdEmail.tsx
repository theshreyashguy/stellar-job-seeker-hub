
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Send, ArrowLeft, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ColdEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const company = searchParams.get('company') || 'Unknown Company';
  const role = searchParams.get('role') || 'Unknown Role';
  
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [employeeInfo, setEmployeeInfo] = useState('');

  const handleSendEmail = async () => {
    setIsSending(true);
    
    // Simulate sending cold email
    setTimeout(() => {
      setIsSent(true);
      toast({
        title: "Cold Email Sent!",
        description: `Your email regarding ${role} at ${company} has been sent.`,
      });
      setIsSending(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="glass rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              Send Cold Email
            </h1>
            <div className="space-y-2">
              <p className="text-xl text-stellar-purple font-medium">{role}</p>
              <p className="text-lg text-stellar-cyan">{company}</p>
            </div>
          </div>

          {isSent ? (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Cold Email Sent!</h2>
                <p className="text-gray-300">
                  Your personalized cold email has been sent to relevant contacts at {company}.
                  We'll track this outreach in your analytics dashboard.
                </p>
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigate('/analysis')}
                  className="bg-stellar-purple hover:bg-stellar-purple/80 text-white px-6 py-3 rounded-lg transition-colors duration-300"
                >
                  View Analytics
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors duration-300"
                >
                  Back to Home
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-stellar-navy/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-3">Email Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Position:</span>
                    <span className="text-white">{role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Company:</span>
                    <span className="text-white">{company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
                    <span className="text-white">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-white font-medium">
                  <User size={18} />
                  <span>Specific Employee/Contact (Optional)</span>
                </label>
                <textarea
                  value={employeeInfo}
                  onChange={(e) => setEmployeeInfo(e.target.value)}
                  placeholder="Enter specific employee name, LinkedIn profile, or department to target..."
                  className="w-full p-4 bg-stellar-navy/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-stellar-purple focus:outline-none resize-none"
                  rows={3}
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-blue-200 text-sm">
                  💡 Our AI will craft a personalized cold email highlighting your interest in the role
                  and relevant experience. If you specify an employee, we'll tailor the message accordingly.
                </p>
              </div>

              <div className="text-center">
                <button
                  onClick={handleSendEmail}
                  disabled={isSending}
                  className="bg-stellar-cyan hover:bg-stellar-cyan/80 text-white px-8 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors duration-300 disabled:opacity-50"
                >
                  <Send size={20} />
                  <span>{isSending ? 'Sending...' : 'Send Cold Email'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColdEmail;
