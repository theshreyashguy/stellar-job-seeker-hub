import { useState, useCallback } from "react";

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
  hasReply?: boolean;
  thread?: GmailMessage[];
}

const GMAIL_API_URL = "https://www.googleapis.com/gmail/v1/users/me";

export const useGmail = (accessToken: string | null) => {
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessage | null>(
    null
  );

  const getHeader = useCallback(
    (message: GmailMessage, name: string): string => {
      const header = message.payload.headers.find((h) => h.name === name);
      return header?.value || "";
    },
    []
  );

  const makeRequest = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      if (!accessToken) {
        throw new Error("Not authenticated");
      }
      const response = await fetch(`${GMAIL_API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        if (error.error.code === 401) {
          // Handle token expiration
          localStorage.removeItem("google_access_token");
          window.location.reload();
        }
        throw new Error(error.error.message || "API request failed");
      }
      return response.json();
    },
    [accessToken]
  );

  const searchMessages = useCallback(
    async (query = "in:sent sde applicant") => {
      setIsLoading(true);
      try {
        const resp = await makeRequest(
          `/messages?q=${encodeURIComponent(query)}&maxResults=50`
        );
        const msgs = resp.messages || [];
        if (msgs.length) {
          const uniqueThreadIds = [
            ...new Set(msgs.map((m: { threadId: string }) => m.threadId)),
          ];

          const threads = await Promise.all(
            uniqueThreadIds.map((threadId) =>
              makeRequest(`/threads/${threadId}`)
            )
          );

          const processedMessages = threads.map((thread: any) => {
            const firstMessage = thread.messages[0];
            const userEmail = getHeader(firstMessage, "From"); 

            const hasReply = thread.messages.some(
              (msg: GmailMessage) => getHeader(msg, "From") !== userEmail
            );

            return {
              ...firstMessage,
              hasReply,
              thread: thread.messages,
            };
          });

          setMessages(processedMessages);
        } else {
          setMessages([]);
        }
      } catch (e) {
        console.error("Error fetching messages:", e);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    },
    [makeRequest, getHeader]
  );

  const getMessageBody = useCallback((message: GmailMessage): string => {
    let body = "";
    if (message.payload.body?.data) {
      body = atob(
        message.payload.body.data.replace(/-/g, "+").replace(/_/g, "/")
      );
    } else if (message.payload.parts) {
      for (const part of message.payload.parts) {
        if (part.mimeType === "text/plain" && part.body?.data) {
          body = atob(part.body.data.replace(/-/g, "+").replace(/_/g, "/"));
          break;
        }
        if (part.mimeType === "text/html" && part.body?.data && !body) {
          body = atob(part.body.data.replace(/-/g, "+").replace(/_/g, "/"));
        }
      }
    }
    return body || message.snippet;
  }, []);

  const sendReply = useCallback(
    async (original: GmailMessage, replyText: string) => {
      try {
        const subject = getHeader(original, "Subject");
        const to = getHeader(original, "From");
        const messageId = getHeader(original, "Message-ID");
        const email = [
          `To: ${to}`,
          `Subject: Re: ${subject}`,
          `In-Reply-To: ${messageId}`,
          `References: ${messageId}`,
          "",
          replyText,
        ].join("\n");
        const raw = btoa(email)
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+\$/, "");
        await makeRequest("/messages/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ raw, threadId: original.threadId }),
        });
        return true;
      } catch (err) {
        console.error("Error sending reply:", err);
        return false;
      }
    },
    [getHeader, makeRequest]
  );

  const sendFollowUp = useCallback(
    async (original: GmailMessage) => {
      try {
        const subject = getHeader(original, "Subject");
        const to = getHeader(original, "To");
        const messageId = getHeader(original, "Message-ID");
        const followUpText = `Hi,\n\nI'm just following up on my previous email. I'm still very interested in the position and would love to hear back from you.\n\nBest regards,\n[Your Name]`;

        const email = [
          `To: ${to}`,
          `Subject: Following up: ${subject}`,
          `In-Reply-To: ${messageId}`,
          `References: ${messageId}`,
          "",
          followUpText,
        ].join("\n");
        const raw = btoa(email)
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+\$/, "");
        await makeRequest("/messages/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ raw, threadId: original.threadId }),
        });
        return true;
      } catch (err) {
        console.error("Error sending follow-up:", err);
        return false;
      }
    },
    [getHeader, makeRequest]
  );

  return {
    messages,
    isLoading,
    selectedMessage,
    setSelectedMessage,
    searchMessages,
    getMessageBody,
    getHeader,
    sendReply,
    sendFollowUp,
    isInitialized: !!accessToken,
  };
};