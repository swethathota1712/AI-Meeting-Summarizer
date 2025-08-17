import { useState } from "react";
import { Share, ArrowLeft, Plus, X, Mail, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ShareSectionProps {
  summaryId: string;
  summaryContent: string;
  onBack: () => void;
  onSuccess: () => void;
}

export function ShareSection({ summaryId, summaryContent, onBack, onSuccess }: ShareSectionProps) {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [subject, setSubject] = useState("Meeting Summary - AI Generated");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const { toast } = useToast();

  const addRecipient = () => {
    const email = emailInput.trim();
    if (!email) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (recipients.includes(email)) {
      toast({
        title: "Duplicate email",
        description: "This email is already in the list",
        variant: "destructive"
      });
      return;
    }

    setRecipients([...recipients, email]);
    setEmailInput("");
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRecipient();
    }
  };

  const copyFinalSummary = async () => {
    try {
      // Convert HTML to plain text for copying
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = summaryContent;
      const textContent = tempDiv.innerText || tempDiv.textContent || '';
      
      await navigator.clipboard.writeText(textContent);
      toast({
        title: "Summary copied",
        description: "The summary has been copied to your clipboard"
      });
    } catch (error) {
      console.error('Copy error:', error);
      toast({
        title: "Copy failed",
        description: "Failed to copy summary",
        variant: "destructive"
      });
    }
  };

  const sendEmail = async () => {
    if (recipients.length === 0) {
      toast({
        title: "No recipients",
        description: "Please add at least one email recipient",
        variant: "destructive"
      });
      return;
    }

    if (!subject.trim()) {
      toast({
        title: "Subject required",
        description: "Please enter an email subject",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summaryId,
          recipients,
          subject: subject.trim(),
          message: message.trim() || undefined
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
      }

      // Show success animation
      setShowSuccessAnimation(true);
      setTimeout(() => {
        setShowSuccessAnimation(false);
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Email sending error:', error);
      toast({
        title: "Failed to send email",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 text-center animate-bounce-in">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <Mail className="text-white w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-green-600 mb-2">Email Sent! ✨</h3>
            <p className="text-gray-600">Your summary is on its way to {recipients.length} recipient{recipients.length > 1 ? 's' : ''}!</p>
          </div>
        </div>
      )}
      
      <div className="glass-card p-8 animate-slide-up" data-testid="share-section">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Share className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold shimmer-text">Share Summary via Email</h2>
            <p className="text-sm text-muted-foreground">Send your polished summary to team members</p>
          </div>
        </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="email-recipients" className="block text-sm font-semibold text-gray-800 mb-3">
            📧 Recipient Email Addresses
          </label>
          <div className="space-y-3">
            <div className="flex space-x-3">
              <Input
                id="email-recipients"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter email address (e.g., john@company.com)"
                className="flex-1 border-2 border-purple-200 focus:border-purple-500 rounded-xl transition-colors duration-200"
                data-testid="input-email-recipient"
              />
              <Button
                onClick={addRecipient}
                className="btn-gradient-accent px-6 rounded-xl hover:scale-105 transition-transform duration-200"
                data-testid="button-add-recipient"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            {recipients.map((email, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 animate-slide-up"
                data-testid={`recipient-${index}`}
              >
                <span className="text-sm font-medium text-gray-700">{email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRecipient(email)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  data-testid={`button-remove-recipient-${index}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="email-subject" className="block text-sm font-semibold text-gray-800 mb-3">
            ✨ Subject Line
          </label>
          <Input
            id="email-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Meeting Summary - AI Generated"
            className="w-full border-2 border-blue-200 focus:border-blue-500 rounded-xl transition-colors duration-200"
            data-testid="input-email-subject"
          />
        </div>

        <div>
          <label htmlFor="email-message" className="block text-sm font-semibold text-gray-800 mb-3">
            💬 Additional Message (Optional)
          </label>
          <Textarea
            id="email-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Add a personal message to include with the summary..."
            className="w-full resize-none border-2 border-green-200 focus:border-green-500 rounded-xl transition-colors duration-200"
            data-testid="input-email-message"
          />
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-5 animate-pulse-glow">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-yellow-800">
              <p className="font-bold mb-2">📋 Preview before sending</p>
              <p>The AI-generated summary will be beautifully formatted and included in the email body. Recipients will receive your polished summary along with any personal message you add.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="px-6 py-3 hover:bg-gray-50 transition-all duration-200"
          data-testid="button-back-to-edit"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Edit
        </Button>
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={copyFinalSummary}
            className="btn-gradient-accent px-6 py-3 hover:scale-105 transition-transform duration-200"
            data-testid="button-copy-final-summary"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Summary
          </Button>
          <Button
            onClick={sendEmail}
            disabled={isSending || recipients.length === 0}
            className="btn-gradient-primary px-8 py-3 font-semibold rounded-xl hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            data-testid="button-send-email"
          >
            {isSending ? (
              <>
                <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
