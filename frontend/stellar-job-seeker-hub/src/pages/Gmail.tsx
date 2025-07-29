import React, { useState, useEffect, useMemo } from "react";
import {
  RefreshCw,
  Send,
  Mail,
  LogIn,
  LogOut,
  Search,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useGmail, GmailMessage } from "@/hooks/useGmail";
import EmailList from "@/components/EmailList";
import EmailViewer from "@/components/EmailViewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const Gmail = () => {
  const [searchQuery, setSearchQuery] = useState("sde applicant");
  const [filter, setFilter] = useState<"all" | "replied" | "no-reply">("all");
  const { toast } = useToast();
  const { isSignedIn, isLoading, error, signIn, signOut, accessToken } =
    useGoogleAuth();
  const {
    messages,
    isLoading: isLoadingMessages,
    selectedMessage,
    setSelectedMessage,
    searchMessages,
    getMessageBody,
    getHeader,
    sendFollowUp,
    isInitialized,
  } = useGmail(accessToken);

  useEffect(() => {
    if (isSignedIn && isInitialized) {
      searchMessages(searchQuery);
    }
  }, [isSignedIn, isInitialized, searchQuery, searchMessages]);

  const handleSearch = () => {
    if (isSignedIn) {
      searchMessages(searchQuery);
    }
  };

  const handleFollowupAll = async () => {
    if (!isSignedIn) {
      toast({
        title: "Please sign in first",
        description: "You need to sign in to Gmail to send follow-ups.",
        variant: "destructive",
      });
      return;
    }

    const noReplyMessages = messages.filter((m) => !m.hasReply);
    if (noReplyMessages.length === 0) {
      toast({
        title: "No follow-ups to send",
        description: "All emails have been replied to.",
      });
      return;
    }

    try {
      await Promise.all(noReplyMessages.map(sendFollowUp));
      toast({
        title: "Follow-ups sent!",
        description: `Sent ${noReplyMessages.length} follow-up emails`,
      });
      // Refresh messages after sending follow-ups
      searchMessages(searchQuery);
    } catch (error) {
      toast({
        title: "Error sending follow-ups",
        description: "Could not send follow-up emails. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredMessages = useMemo(() => {
    if (filter === "all") return messages;
    if (filter === "replied") return messages.filter((m) => m.hasReply);
    if (filter === "no-reply") return messages.filter((m) => !m.hasReply);
    return messages;
  }, [messages, filter]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-300">Loading Gmail...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              Gmail Management
            </h1>
            <p className="text-gray-300 text-lg mb-8">
              Sign in to manage your job application emails and follow-ups
            </p>
          </div>

          {error && (
            <div className="glass rounded-2xl p-6 mb-6 border border-red-500/20">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="glass rounded-2xl p-8 text-center">
            <Mail size={64} className="mx-auto mb-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Connect Your Gmail
            </h2>
            <p className="text-gray-300 mb-6">
              Sign in with your Google account to access your emails and manage
              your job applications
            </p>
            <Button
              onClick={() => signIn()}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 px-8 py-3 text-lg"
            >
              <LogIn className="mr-2" size={20} />
              {isLoading ? "Loading..." : "Sign in with Gmail"}
            </Button>
          </div>

          <div className="mt-6 glass rounded-xl p-4">
            <p className="text-gray-400 text-sm text-center">
              💡 We'll search for emails containing "sde applicant" and help you
              manage your job applications
            </p>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Header Controls */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <Mail className="text-red-500" size={24} />
              <div>
                <h2 className="text-xl font-bold text-white">
                  Application Emails
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>Status:</span>
                  {!isInitialized ? (
                    <span className="text-yellow-400 flex items-center">
                      <RefreshCw className="animate-spin mr-2" size={16} />
                      Initializing Gmail API...
                    </span>
                  ) : (
                    <span className="text-green-400">✓ Ready</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex-grow">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search emails..."
                  className="bg-white/10 border-white/20 text-white w-full"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handleSearch}
                  disabled={isLoadingMessages || !isInitialized}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Search size={16} className="mr-2" />
                  Search
                </Button>
                <Button
                  onClick={handleFollowupAll}
                  disabled={isLoadingMessages || !isInitialized || messages.filter(m => !m.hasReply).length === 0}
                  className="bg-stellar-purple hover:bg-stellar-purple/80"
                >
                  <Send size={16} className="mr-2" />
                  Follow-up All ({messages.filter(m => !m.hasReply).length})
                </Button>
                <Button onClick={signOut} variant="ghost">
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm text-gray-400">Filter by:</span>
            <Button
              variant={filter === "all" ? "secondary" : "ghost"}
              onClick={() => setFilter("all")}
            >
              All ({messages.length})
            </Button>
            <Button
              variant={filter === "replied" ? "secondary" : "ghost"}
              onClick={() => setFilter("replied")}
            >
              Replied ({messages.filter((m) => m.hasReply).length})
            </Button>
            <Button
              variant={filter === "no-reply" ? "secondary" : "ghost"}
              onClick={() => setFilter("no-reply")}
            >
              No Reply ({messages.filter((m) => !m.hasReply).length})
            </Button>
          </div>
        </div>

        {/* Email Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="order-2 lg:order-1">
            <EmailList
              messages={filteredMessages}
              selectedMessage={selectedMessage}
              onSelectMessage={setSelectedMessage}
              getHeader={getHeader}
            />
          </div>

          <div className="order-1 lg:order-2">
            <EmailViewer
              message={selectedMessage}
              getHeader={getHeader}
              getMessageBody={getMessageBody}
              sendReply={() => {}}
            />
          </div>
        </div>

        <div className="mt-6 glass rounded-xl p-4">
          <p className="text-gray-400 text-sm text-center">
            💡 Search for keywords like "sde applicant", "software engineer", or
            company names to find relevant emails
          </p>
        </div>
      </div>
    </div>
  );
};

export default Gmail;