// Add this script tag to your public/index.html:
// <script async defer src="https://apis.google.com/js/api.js"></script>

import { useState, useEffect, useCallback } from "react";
import { gapi } from "gapi-script";

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

const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest";
const CLIENT_ID =
  "851068951455-4u7jf9lpg9a646tqe3uffdmouk1cc40e.apps.googleusercontent.com";
const SCOPES = [
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
].join(" ");

export const useGmail = ({ isSignedIn }: { isSignedIn: boolean }) => {
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessage | null>(
    null
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize gapi client once
  useEffect(() => {
    if (!isSignedIn || isInitialized) return;
    gapi.load("client:auth2", async () => {
      try {
        await gapi.client.init({
          clientId: CLIENT_ID,
          discoveryDocs: [DISCOVERY_DOC],
          scope: SCOPES,
        });
        setIsInitialized(true);
      } catch (err) {
        console.error("Error initializing Gmail API client:", err);
      }
    });
  }, [isSignedIn, isInitialized]);

  // Search messages
  const searchMessages = useCallback(
    async (query = "in:sent sde applicant") => {
      if (!isInitialized) return;
      setIsLoading(true);
      try {
        const resp = await gapi.client.gmail.users.messages.list({
          userId: "me",
          q: `in:sent  ${query}`,
          maxResults: 50,
        });
        const msgs = resp.result.messages || [];
        if (msgs.length) {
          const details = await Promise.all(
            msgs.map((m) =>
              gapi.client.gmail.users.messages
                .get({ userId: "me", id: m.id })
                .then((r) => r.result as GmailMessage)
            )
          );
          setMessages(details);
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
    [isInitialized]
  );

  // Decode body
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

  // Get header
  const getHeader = useCallback(
    (message: GmailMessage, name: string): string => {
      const header = message.payload.headers.find((h) => h.name === name);
      return header?.value || "";
    },
    []
  );

  // Send reply
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
          .replace(/=+$/, "");
        await gapi.client.gmail.users.messages.send({
          userId: "me",
          resource: { raw, threadId: original.threadId },
        });
        return true;
      } catch (err) {
        console.error("Error sending reply:", err);
        return false;
      }
    },
    [getHeader]
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
    isInitialized,
  };
};
