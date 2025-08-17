import { useState, useEffect, useRef } from "react";
import { FileEdit, ArrowLeft, ArrowRight, Copy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SummaryEditorProps {
  summaryId: string;
  initialSummary: string;
  onBack: () => void;
  onNext: (editedSummary: string) => void;
  onRegenerate: () => void;
}

export function SummaryEditor({ 
  summaryId, 
  initialSummary, 
  onBack, 
  onNext, 
  onRegenerate 
}: SummaryEditorProps) {
  const [summary, setSummary] = useState(initialSummary);
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setSummary(initialSummary);
    if (editorRef.current) {
      editorRef.current.innerHTML = initialSummary;
    }
  }, [initialSummary]);

  const handleContentChange = () => {
    if (editorRef.current) {
      setSummary(editorRef.current.innerHTML);
    }
  };

  const saveSummary = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/summaries/${summaryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          editedSummary: summary
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save summary');
      }

      toast({
        title: "Summary saved",
        description: "Your edits have been saved successfully"
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save failed",
        description: "Failed to save your edits",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);

  const copyToClipboard = async () => {
    try {
      const textContent = editorRef.current?.innerText || summary;
      await navigator.clipboard.writeText(textContent);
      
      // Show animated tooltip
      setShowCopiedTooltip(true);
      setTimeout(() => setShowCopiedTooltip(false), 2000);
    } catch (error) {
      console.error('Copy error:', error);
      toast({
        title: "Copy failed",
        description: "Failed to copy summary to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleNext = async () => {
    // Save before proceeding
    if (summary !== initialSummary) {
      await saveSummary();
    }
    onNext(summary);
  };

  return (
    <div className="glass-card p-8 animate-slide-up" data-testid="summary-editor-section">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FileEdit className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold shimmer-text">Review & Edit Summary</h2>
            <p className="text-sm text-muted-foreground">Fine-tune your AI-generated summary</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="btn-gradient-accent hover:scale-105 transition-transform duration-200"
              data-testid="button-copy-summary"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Summary
            </Button>
            {showCopiedTooltip && (
              <div className="tooltip absolute -top-12 left-1/2 transform -translate-x-1/2">
                Copied! ✨
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            className="hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
            data-testid="button-regenerate-summary"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
        </div>
      </div>

      <div className="summary-box p-6 min-h-[350px] focus-within:animate-glow transition-all duration-300">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          onBlur={saveSummary}
          className="outline-none min-h-[300px] prose prose-lg max-w-none text-gray-800"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          dangerouslySetInnerHTML={{ __html: initialSummary }}
          data-testid="summary-editor"
        />
      </div>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="px-6 py-3 hover:bg-gray-50 transition-all duration-200"
          data-testid="button-back-to-prompt"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Instructions
        </Button>
        <Button
          onClick={handleNext}
          disabled={isSaving}
          className="btn-gradient-primary px-8 py-3 text-white font-semibold rounded-xl hover:scale-105 transition-transform duration-200"
          data-testid="button-proceed-to-share"
        >
          {isSaving ? (
            <>
              <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
              Saving...
            </>
          ) : (
            <>
              Continue to Share
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
