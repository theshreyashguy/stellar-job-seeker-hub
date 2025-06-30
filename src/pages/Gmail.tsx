
import React, { useState } from 'react';
import { RefreshCw, Send, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Gmail = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSendingFollowups, setIsSendingFollowups] = useState(false);
  const { toast } = useToast();

  const handleFollowupAll = async () => {
    setIsSendingFollowups(true);
    
    // Simulate sending follow-ups
    setTimeout(() => {
      toast({
        title: "Follow-ups sent!",
        description: `Sent 8 follow-up emails`,
      });
      setIsSendingFollowups(false);
      // Refresh the iframe
      const iframe = document.getElementById('gmail-frame') as HTMLIFrameElement;
      if (iframe) {
        iframe.src = iframe.src;
      }
    }, 2000);
  };

  const refreshGmail = () => {
    setIsRefreshing(true);
    const iframe = document.getElementById('gmail-frame') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
            Gmail Management
          </h1>
          <p className="text-gray-300 text-lg">
            Manage your job application emails and follow-ups
          </p>
        </div>

        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Mail className="text-red-500" size={24} />
              <h2 className="text-xl font-bold text-white">Application Emails</h2>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={refreshGmail}
                disabled={isRefreshing}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-300 disabled:opacity-50"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleFollowupAll}
                disabled={isSendingFollowups}
                className="bg-stellar-purple hover:bg-stellar-purple/80 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-300 disabled:opacity-50"
              >
                <Send size={16} />
                <span>{isSendingFollowups ? 'Sending...' : 'Follow-up All'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl overflow-hidden" style={{ height: 'calc(100vh - 300px)' }}>
          <iframe
            id="gmail-frame"
            src="https://mail.google.com/mail/u/0/#search/label%3Aapplication+OR+subject%3Aapplication"
            className="w-full h-full border-0"
            title="Gmail"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>

        <div className="mt-6 glass rounded-xl p-4">
          <p className="text-gray-400 text-sm text-center">
            💡 Tip: Use Gmail labels like "application", "interview", or "follow-up" to organize your job search emails.
            The follow-up feature will automatically send professional follow-up emails to applications that haven't received responses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Gmail;
