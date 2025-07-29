import React, { useState, useMemo } from "react";
import DOMPurify from "dompurify";
import { Reply, Send, CornerDownRight, MessageCircle } from "lucide-react";
import { GmailMessage } from "@/hooks/useGmail";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface EmailViewerProps {
  message: GmailMessage | null;
  getHeader: (message: GmailMessage, name: string) => string;
  getMessageBody: (message: GmailMessage) => string;
  sendReply: (message: GmailMessage, replyText: string) => Promise<boolean>;
  sendFollowUp?: (message: GmailMessage) => Promise<boolean>;
  onBack?: () => void;
}

const EmailMessageContent: React.FC<{ message: GmailMessage, getHeader: any, getMessageBody: any }> = ({ message, getHeader, getMessageBody }) => {
  const fromEmail = getHeader(message, "From");
  const fromName = fromEmail.includes("<") ? fromEmail.split("<")[0].trim().replace(/"/g, "") : fromEmail.split("@")[0];
  const cleanBody = DOMPurify.sanitize(getMessageBody(message));

  const formatDate = (internalDate: string) => {
    const date = new Date(parseInt(internalDate, 10));
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (email: string) => {
    const name = email.split("@")[0];
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="p-6 border-b border-border/30">
      <div className="flex items-start space-x-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src="" />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {getInitials(fromEmail)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">{fromName}</h3>
              <p className="text-sm text-muted-foreground">{fromEmail}</p>
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDate(message.internalDate)}
            </div>
          </div>
          <div className="mt-2 flex items-center space-x-2 text-sm text-muted-foreground">
            <span>to</span>
            <span className="font-medium">{getHeader(message, "To")}</span>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <div
            className="text-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: cleanBody }}
          />
        </div>
      </div>
    </div>
  );
};

const EmailViewer: React.FC<EmailViewerProps> = ({
  message,
  getHeader,
  getMessageBody,
  sendReply,
  sendFollowUp,
}) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const canReply = useMemo(() => {
    if (!message || !message.thread) return false;
    const lastMessage = message.thread[message.thread.length - 1];
    const fromHeader = getHeader(lastMessage, "From");
    // A simple check if the user sent the last email. 
    // This might need to be more robust based on the actual user email.
    return !fromHeader.includes("me"); 
  }, [message, getHeader]);

  if (!message) {
    return (
      <div className="glass rounded-xl p-8 text-center h-full flex items-center justify-center">
        <div className="text-muted-foreground">
          <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">Select a conversation to view</p>
          <p className="text-sm">You can filter conversations by replied or no-reply status.</p>
        </div>
      </div>
    );
  }

  const handleReply = async () => {
    if (!replyText.trim() || !message) return;
    setIsSending(true);
    const success = await sendReply(message, replyText);
    toast({
      title: success ? "Reply sent!" : "Failed to send reply",
      description: success
        ? "Your reply has been sent successfully."
        : "Error sending your reply. Please try again.",
      variant: success ? "default" : "destructive",
    });
    if (success) {
      setShowReplyBox(false);
      setReplyText("");
    }
    setIsSending(false);
  };

  const handleFollowUp = async () => {
    if (!message || !sendFollowUp) return;
    const success = await sendFollowUp(message);
    toast({
      title: success ? "Follow-up sent!" : "Failed to send follow-up",
      description: success
        ? "Your follow-up has been sent successfully."
        : "Error sending your follow-up. Please try again.",
      variant: success ? "default" : "destructive",
    });
  };

  const subject = getHeader(message, "Subject") || "No Subject";

  return (
    <div className="glass rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-border/50 flex-shrink-0">
        <h1 className="text-lg font-semibold text-foreground line-clamp-1">
          {subject}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {message.thread?.map((threadMessage) => (
          <EmailMessageContent 
            key={threadMessage.id} 
            message={threadMessage} 
            getHeader={getHeader} 
            getMessageBody={getMessageBody} 
          />
        ))}
      </div>

      <div className="p-6 border-t border-border/50 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowReplyBox(!showReplyBox)}
            variant="outline"
            size="sm"
            className="bg-background"
            disabled={!canReply}
          >
            <Reply size={16} className="mr-2" /> Reply
          </Button>
          {!message.hasReply && sendFollowUp && (
            <Button
              onClick={handleFollowUp}
              variant="outline"
              size="sm"
              className="bg-background"
            >
              <CornerDownRight size={16} className="mr-2" /> Follow Up
            </Button>
          )}
        </div>
      </div>

      {showReplyBox && (
        <div className="border-t border-border/50 bg-muted/20 flex-shrink-0">
          <div className="p-6">
            <div className="space-y-4">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                className="min-h-32 bg-background border-border/50 resize-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button
                    onClick={handleReply}
                    disabled={isSending || !replyText.trim()}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send size={16} className="mr-2" />
                    {isSending ? "Sending..." : "Send"}
                  </Button>
                  <Button
                    onClick={() => setShowReplyBox(false)}
                    variant="ghost"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="px-2 py-0.5">
                    Ctrl+Enter to send
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailViewer;
