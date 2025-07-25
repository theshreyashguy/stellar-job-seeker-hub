import React, { useState } from "react";
import DOMPurify from "dompurify";
import parse from "html-react-parser";
import { Reply, Forward, Trash2, Archive, Star, Send, MoreHorizontal, ArrowLeft, Printer, Download } from "lucide-react";
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
  onBack?: () => void;
}

const EmailViewer: React.FC<EmailViewerProps> = ({
  message,
  getHeader,
  getMessageBody,
  sendReply,
  onBack,
}) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const { toast } = useToast();

  if (!message) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <div className="text-muted-foreground">
          <p className="text-lg">Select an email to view</p>
        </div>
      </div>
    );
  }

  const formatDate = (internalDate: string) => {
    const date = new Date(parseInt(internalDate, 10));
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
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

  const handleStar = async () => {
    setIsStarred(!isStarred);
    toast({
      title: isStarred ? "Removed from starred" : "Added to starred",
      description: isStarred ? "Email unmarked" : "Email starred",
    });
  };

  const handleDelete = async () => {
    toast({
      title: "Email deleted",
      description: "Email moved to trash",
    });
  };

  const handleArchive = async () => {
    toast({
      title: "Email archived",
      description: "Email moved to archive",
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
        return `<blockquote class="pl-4 border-l-2 border-border italic text-muted-foreground bg-muted/20 rounded-r-lg py-2">${line.replace(
          /^>+\s?/,
          ""
        )}</blockquote>`;
      }
      if (/^On .* wrote:/.test(line)) {
        return `<hr class="my-4 border-border"><p class="text-sm text-muted-foreground italic">${line}</p>`;
      }
      if (line.trim() === "") {
        return `<br>`;
      }
      return `<p class="mb-3 leading-relaxed">${line}</p>`;
    })
    .join("");

  const cleanBody = DOMPurify.sanitize(htmlBody);

  const fromEmail = getHeader(message, "From");
  const fromName = fromEmail.includes("<") ? fromEmail.split("<")[0].trim().replace(/"/g, "") : fromEmail.split("@")[0];
  const subject = getHeader(message, "Subject") || "No Subject";

  return (
    <div className="glass rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header with back button and actions */}
      <div className="p-4 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft size={16} />
              </Button>
            )}
            <h1 className="text-lg font-semibold text-foreground line-clamp-1">
              {subject}
            </h1>
          </div>
          {/* <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={handleArchive}>
              <Archive size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleStar}
              className={isStarred ? "text-yellow-500" : ""}
            >
              <Star size={16} fill={isStarred ? "currentColor" : "none"} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete}>
              <Trash2 size={16} />
            </Button>
            <Button variant="ghost" size="sm">
              <Printer size={16} />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal size={16} />
            </Button>
          </div> */}
        </div>
      </div>

      {/* Email content */}
      <div className="flex-1 overflow-y-auto">
        {/* Sender info */}
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
        </div>

        {/* Email body */}
        <div className="p-6">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <div
              className="text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: cleanBody }}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-6 pb-6">
          <Separator className="mb-4" />
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowReplyBox(!showReplyBox)}
              variant="outline"
              size="sm"
              className="bg-background"
            >
              <Reply size={16} className="mr-2" /> Reply
            </Button>
            <Button variant="outline" size="sm" className="bg-background">
              <Forward size={16} className="mr-2" /> Forward
            </Button>
          </div>
        </div>
      </div>

      {/* Reply box */}
      {showReplyBox && (
        <div className="border-t border-border/50 bg-muted/20 flex-shrink-0">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  ME
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Reply to {fromName}</p>
                <p className="text-xs text-muted-foreground">Re: {subject}</p>
              </div>
            </div>
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
