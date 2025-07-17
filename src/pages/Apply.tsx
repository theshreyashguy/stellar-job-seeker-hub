
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Send, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useJobOpportunities } from "@/hooks/useJobOpportunities";

const Apply = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { opportunities } = useJobOpportunities();
  
  const company = searchParams.get('company') || 'Unknown Company';
  const role = searchParams.get('role') || 'Unknown Role';
  
  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    if (opportunities.length > 0) {
      console.log("Opportunities available in Apply page:", opportunities);
    }
  }, [opportunities]);

  const handleApply = async () => {
    setIsApplying(true);
    
    // Simulate application submission
    setTimeout(() => {
      setIsApplied(true);
      toast({
        title: "Application Submitted!",
        description: `Your application for ${role} at ${company} has been submitted.`,
      });
      setIsApplying(false);
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
              Apply for Position
            </h1>
            <div className="space-y-2">
              <p className="text-xl text-stellar-purple font-medium">{role}</p>
              <p className="text-lg text-stellar-cyan">{company}</p>
            </div>
          </div>

          {isApplied ? (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
                <p className="text-gray-300">
                  Your application has been successfully submitted. We'll track this application
                  in your analytics dashboard.
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
                <h3 className="text-lg font-bold text-white mb-3">Application Details</h3>
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

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <p className="text-yellow-200 text-sm">
                  ⚡ This will automatically submit your pre-configured application materials
                  and track the application in your dashboard.
                </p>
              </div>

              <div className="text-center">
                <button
                  onClick={handleApply}
                  disabled={isApplying}
                  className="bg-stellar-purple hover:bg-stellar-purple/80 text-white px-8 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors duration-300 disabled:opacity-50"
                >
                  <Send size={20} />
                  <span>{isApplying ? 'Submitting...' : 'Submit Application'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Apply;
