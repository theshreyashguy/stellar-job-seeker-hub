import React, { useState } from "react";
import DOMPurify from "dompurify";
import parse from "html-react-parser";
import { Reply, Forward, Trash2, Archive, Star, Send } from "lucide-react";
import { GmailMessage } from "@/hooks/useGmail";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface EmailViewerProps {
  message: GmailMessage | null;
  getHeader: (message: GmailMessage, name: string) => string;
  getMessageBody: (message: GmailMessage) => string;
  sendReply: (message: GmailMessage, replyText: string) => Promise<boolean>;
}

const EmailViewer: React.FC<EmailViewerProps> = ({
  message,
  getHeader,
  getMessageBody,
  sendReply,
}) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  if (!message) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <div className="text-gray-400">
          <p className="text-lg">Select an email to view</p>
        </div>
      </div>
    );
  }

  const formatDate = (internalDate: string) => {
    const date = new Date(parseInt(internalDate, 10));
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setIsSending(true);
    const success = await sendReply(message, replyText);
    toast({
      title: success ? "Reply sent!" : "Failed to send reply",
      description: success
        ? "Your reply has been sent successfully."
        : "Error sending your reply. Please try again.",
      variant: success ? "default" : "destructive",
    });
    if (success) setShowReplyBox(false);
    setIsSending(false);
  };

  // Build sanitized HTML with quotes and separators
  const rawBody = getMessageBody(message);
  const htmlBody = rawBody
    .split("\n")
    .map((line) => {
      if (line.startsWith(">")) {
        return `<blockquote class=\"pl-4 border-l-2 border-gray-600 italic text-gray-400\">${line.replace(
          /^>+\s?/,
          ""
        )}</blockquote>`;
      }
      if (/^On .* wrote:/.test(line)) {
        return `<hr class=\"my-4 border-gray-600\"><p class=\"text-sm text-gray-400 italic\">${line}</p>`;
      }
      return `<p>${line}</p>`;
    })
    .join("");

  const cleanBody = DOMPurify.sanitize(htmlBody);

  return (
    <div className="glass rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-white/10 flex-shrink-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white mb-2">
              {getHeader(message, "Subject") || "No Subject"}
            </h1>
            <div className="space-y-1 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <span className="font-medium">From:</span>
                <span>{getHeader(message, "From")}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">To:</span>
                <span>{getHeader(message, "To")}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">Date:</span>
                <span>{formatDate(message.internalDate)}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2 ml-4">
            <Button variant="ghost" size="sm">
              <Archive size={16} />
            </Button>
            <Button variant="ghost" size="sm">
              <Star size={16} />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowReplyBox(!showReplyBox)}
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Reply size={16} className="mr-2" /> Reply
          </Button>
          <Button variant="ghost" size="sm">
            <Forward size={16} className="mr-2" /> Forward
          </Button>
        </div>
      </div>

      <div className="p-6 overflow-y-auto prose prose-invert max-w-none flex-1">
        {parse(cleanBody)}
      </div>

      {showReplyBox && (
        <div className="border-t border-white/10 p-6 flex-shrink-0">
          <h3 className="text-lg font-semibold text-white mb-4">Reply</h3>
          <div className="space-y-4">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply here..."
              className="min-h-32 bg-white/5 border-white/20 text-white"
            />
            <div className="flex space-x-2">
              <Button
                onClick={handleReply}
                disabled={isSending || !replyText.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send size={16} className="mr-2" />
                {isSending ? "Sending..." : "Send Reply"}
              </Button>
              <Button onClick={() => setShowReplyBox(false)} variant="ghost">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailViewer;
