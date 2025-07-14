import { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: Array<{ body?: { data?: string }; mimeType?: string }>;
  };
  internalDate: string;
}

export interface GmailThread {
  id: string;
  messages: GmailMessage[];
}

export const useGmail = () => {
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessage | null>(null);

  const searchMessages = async (query: string = 'sde applicant') => {
    setIsLoading(true);
    try {
      const response = await gapi.client.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 50,
      });

      if (response.result.messages) {
        const messageDetails = await Promise.all(
          response.result.messages.map(async (message: { id: string }) => {
            const detail = await gapi.client.gmail.users.messages.get({
              userId: 'me',
              id: message.id,
            });
            return detail.result as GmailMessage;
          })
        );
        setMessages(messageDetails);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getMessageBody = (message: GmailMessage): string => {
    let body = '';
    
    if (message.payload.body?.data) {
      body = atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    } else if (message.payload.parts) {
      for (const part of message.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
          break;
        }
        if (part.mimeType === 'text/html' && part.body?.data && !body) {
          body = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
      }
    }
    
    return body || message.snippet;
  };

  const getHeader = (message: GmailMessage, name: string): string => {
    const header = message.payload.headers.find(h => h.name === name);
    return header?.value || '';
  };

  const sendReply = async (originalMessage: GmailMessage, replyText: string) => {
    try {
      const subject = getHeader(originalMessage, 'Subject');
      const to = getHeader(originalMessage, 'From');
      const messageId = getHeader(originalMessage, 'Message-ID');
      
      const email = [
        `To: ${to}`,
        `Subject: Re: ${subject}`,
        `In-Reply-To: ${messageId}`,
        `References: ${messageId}`,
        '',
        replyText
      ].join('\n');

      const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      await gapi.client.gmail.users.messages.send({
        userId: 'me',
        resource: {
          raw: encodedEmail,
          threadId: originalMessage.threadId,
        },
      });

      return true;
    } catch (error) {
      console.error('Error sending reply:', error);
      return false;
    }
  };

  return {
    messages,
    isLoading,
    selectedMessage,
    setSelectedMessage,
    searchMessages,
    getMessageBody,
    getHeader,
    sendReply,
  };
};