import { useState } from "react";
import { Bot, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "@/components/progress-indicator";
import { FileUpload } from "@/components/file-upload";
import { PromptSection } from "@/components/prompt-section";
import { SummaryEditor } from "@/components/summary-editor";
import { ShareSection } from "@/components/share-section";
import { useToast } from "@/hooks/use-toast";

type AppStep = 1 | 2 | 3 | 4 | 5; // 5 = success

export default function Home() {
  const [currentStep, setCurrentStep] = useState<AppStep>(1);
  const [transcriptContent, setTranscriptContent] = useState("");
  const [transcriptFilename, setTranscriptFilename] = useState("");
  const [summaryId, setSummaryId] = useState("");
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleFileUploaded = (content: string, filename: string) => {
    setTranscriptContent(content);
    setTranscriptFilename(filename);
  };

  const handleGenerateSummary = async (prompt: string) => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcriptContent,
          prompt: prompt
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate summary');
      }

      const result = await response.json();
      setSummaryId(result.summaryId);
      setGeneratedSummary(result.summary);
      setCurrentStep(3);

      toast({
        title: "Summary generated successfully",
        description: "Your meeting summary is ready for review"
      });
    } catch (error) {
      console.error('Summary generation error:', error);
      toast({
        title: "Failed to generate summary",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateSummary = () => {
    setCurrentStep(2);
    toast({
      title: "Ready to regenerate",
      description: "Modify your instructions and generate a new summary"
    });
  };

  const handleEmailSuccess = () => {
    setCurrentStep(5);
  };

  const startNew = () => {
    setCurrentStep(1);
    setTranscriptContent("");
    setTranscriptFilename("");
    setSummaryId("");
    setGeneratedSummary("");
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen animate-fade-in" data-testid="home-page">
      {/* Header */}
      <header className="glass-card border-0 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center animate-glow">
                <Bot className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-2xl font-bold shimmer-text">AI Meeting Summarizer</h1>
                <p className="text-sm text-muted-foreground">Powered by Advanced AI</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground hidden md:block animate-slide-up">
              Transform your meeting notes into actionable summaries
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        {currentStep < 5 && <ProgressIndicator currentStep={currentStep} />}

        {/* Loading Section */}
        {isGenerating && (
          <div className="mb-8 animate-bounce-in">
            <div className="glass-card p-8">
              <div className="text-center py-8">
                <div className="relative">
                  <div className="animate-spin w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-6 animate-glow"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-400 rounded-full mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                </div>
                <h3 className="text-xl font-bold mb-3 shimmer-text">Generating AI Summary...</h3>
                <p className="text-muted-foreground animate-pulse">Our advanced AI is analyzing your transcript and creating an intelligent summary</p>
                <div className="mt-6 flex justify-center">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: File Upload */}
        {currentStep === 1 && !isGenerating && (
          <FileUpload
            onFileUploaded={handleFileUploaded}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {/* Step 2: Prompt Section */}
        {currentStep === 2 && !isGenerating && (
          <PromptSection
            onBack={() => setCurrentStep(1)}
            onGenerate={handleGenerateSummary}
            isGenerating={isGenerating}
          />
        )}

        {/* Step 3: Summary Editor */}
        {currentStep === 3 && !isGenerating && (
          <SummaryEditor
            summaryId={summaryId}
            initialSummary={generatedSummary}
            onBack={() => setCurrentStep(2)}
            onNext={(editedSummary) => {
              setGeneratedSummary(editedSummary);
              setCurrentStep(4);
            }}
            onRegenerate={handleRegenerateSummary}
          />
        )}

        {/* Step 4: Share Section */}
        {currentStep === 4 && !isGenerating && (
          <ShareSection
            summaryId={summaryId}
            summaryContent={generatedSummary}
            onBack={() => setCurrentStep(3)}
            onSuccess={handleEmailSuccess}
          />
        )}

        {/* Step 5: Success Section */}
        {currentStep === 5 && (
          <div className="mb-8 animate-bounce-in">
            <div className="glass-card p-8 text-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                  <CheckCircle className="text-white w-10 h-10" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
              </div>
              <h3 className="text-2xl font-bold mb-3 shimmer-text">Summary Sent Successfully!</h3>
              <p className="text-muted-foreground mb-6 text-lg">Your meeting summary has been delivered to all recipients with style ✨</p>
              <Button
                onClick={startNew}
                className="btn-gradient-primary px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300"
                data-testid="button-start-new"
              >
                Create New Summary
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="glass-card mt-12 border-0">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">AI Meeting Summarizer - Transform your meetings into actionable insights</p>
            <p className="text-sm text-muted-foreground">Built with ❤️ for productivity and collaboration</p>
            <div className="mt-4 flex justify-center space-x-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
