import React from 'react';
import { Mail, Clock, User, CornerDownRight } from 'lucide-react';
import { GmailMessage } from '@/hooks/useGmail';
import { Badge } from '@/components/ui/badge';

interface EmailListProps {
  messages: GmailMessage[];
  selectedMessage: GmailMessage | null;
  onSelectMessage: (message: GmailMessage) => void;
  getHeader: (message: GmailMessage, name: string) => string;
}

const EmailList: React.FC<EmailListProps> = ({
  messages,
  selectedMessage,
  onSelectMessage,
  getHeader,
}) => {
  const formatDate = (internalDate: string) => {
    const date = new Date(parseInt(internalDate));
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Mail className="text-blue-400" size={20} />
          <h2 className="text-lg font-semibold text-white">SDE Applications</h2>
          <span className="text-sm text-gray-400">({messages.length} conversations)</span>
        </div>
      </div>
      
      <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Mail size={48} className="mx-auto mb-4 opacity-50" />
            <p>No emails found</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 border-b border-white/5 cursor-pointer transition-all duration-200 hover:bg-white/5 ${
                selectedMessage?.id === message.id ? 'bg-blue-500/20 border-l-4 border-l-blue-400' : ''
              }`}
              onClick={() => onSelectMessage(message)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2 min-w-0">
                      <User size={14} className="text-gray-400 flex-shrink-0" />
                      <p className="text-sm font-medium text-white truncate">
                        {getHeader(message, 'To')}
                      </p>
                    </div>
                    {message.hasReply && (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-300 text-xs px-2 py-0.5">
                        <CornerDownRight size={12} className="mr-1"/>
                        Replied
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-sm font-semibold text-white mb-1 truncate">
                    {getHeader(message, 'Subject') || 'No Subject'}
                  </h3>
                  
                  <p className="text-xs text-gray-300 line-clamp-2">
                    {truncateText(message.snippet)}
                  </p>
                </div>
                
                <div className="flex flex-col items-end ml-4 flex-shrink-0">
                  <div className="flex items-center space-x-1 text-xs text-gray-400 mb-1">
                    <Clock size={12} />
                    <span>{formatDate(message.internalDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmailList;