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

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';

export const useGmail = () => {
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessage | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Gmail API client
  useEffect(() => {
    const initGmailApi = async () => {
      try {
        // Check if auth2 is initialized and user is signed in
        if (!gapi.auth2) {
          console.log('Auth2 not initialized yet');
          return;
        }

        const authInstance = gapi.auth2.getAuthInstance();
        if (!authInstance || !authInstance.isSignedIn.get()) {
          console.log('User not signed in');
          return;
        }

        // Initialize the client if not already done
        if (!gapi.client || !gapi.client.gmail) {
          console.log('Initializing Gmail API client...');
          
          await gapi.client.init({
            discoveryDocs: [DISCOVERY_DOC],
          });
          
          console.log('Gmail API client loaded successfully');
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing Gmail API:', error);
      }
    };

    // Try to initialize when auth state changes
    const checkAndInit = () => {
      if (gapi.auth2) {
        const authInstance = gapi.auth2.getAuthInstance();
        if (authInstance && authInstance.isSignedIn.get()) {
          initGmailApi();
        }
      }
    };

    // Listen for auth state changes
    if (gapi.auth2) {
      const authInstance = gapi.auth2.getAuthInstance();
      if (authInstance) {
        authInstance.isSignedIn.listen(checkAndInit);
        checkAndInit(); // Check current state
      }
    }

    // Fallback timeout check
    const timeout = setTimeout(checkAndInit, 1000);
    
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const searchMessages = async (query: string = 'sde applicant') => {
    if (!isInitialized) {
      console.log('Gmail API not initialized yet');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Searching for messages with query:', query);
      
      const response = await gapi.client.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 50,
      });

      console.log('Search response:', response);

      if (response.result.messages && response.result.messages.length > 0) {
        console.log(`Found ${response.result.messages.length} messages`);
        
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
        console.log('No messages found');
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
    isInitialized,
  };
};