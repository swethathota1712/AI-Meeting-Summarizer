import { useState, useEffect } from "react";
import { Edit, ArrowLeft, Sparkles, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface PromptSectionProps {
  onBack: () => void;
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}

export function PromptSection({ onBack, onGenerate, isGenerating }: PromptSectionProps) {
  const [prompt, setPrompt] = useState("Summarize the meeting transcript in bullet points, focusing on key decisions, action items, and next steps. Format it for executive review.");
  const [templates, setTemplates] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    // Load prompt templates
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => setTemplates(data))
      .catch(error => {
        console.error('Failed to load templates:', error);
        toast({
          title: "Failed to load templates",
          description: "Using default template options",
          variant: "destructive"
        });
      });
  }, [toast]);

  const useTemplate = (templateName: string) => {
    const templatePrompt = templates[templateName];
    if (templatePrompt) {
      setPrompt(templatePrompt);
    }
  };

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter instructions for how to summarize the transcript",
        variant: "destructive"
      });
      return;
    }
    onGenerate(prompt.trim());
  };

  const templateButtons = [
    { key: "Executive Summary Format", icon: "📋", label: "Executive Summary Format" },
    { key: "Action Items Only", icon: "✅", label: "Action Items Only" },
    { key: "Project Status Update", icon: "📊", label: "Project Status Update" },
    { key: "Key Decisions & Outcomes", icon: "🎯", label: "Key Decisions & Outcomes" }
  ];

  return (
    <div className="glass-card p-8 animate-slide-up" data-testid="prompt-section">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
          <Edit className="text-white text-lg" />
        </div>
        <div>
          <h2 className="text-xl font-bold shimmer-text">Add Custom Instructions</h2>
          <p className="text-sm text-muted-foreground">Tell the AI how to format your summary</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="prompt-input" className="block text-sm font-semibold text-gray-800 mb-3">
            🎯 How would you like the transcript summarized?
          </label>
          <Textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            className="w-full resize-none border-2 border-orange-200 focus:border-orange-500 rounded-xl transition-colors duration-200"
            placeholder="e.g., 'Summarize in bullet points for executives' or 'Highlight only action items and deadlines'"
            data-testid="input-prompt"
          />
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 animate-pulse-glow">
          <h3 className="font-bold text-blue-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
              <Lightbulb className="w-3 h-3 text-white" />
            </div>
            Quick Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templateButtons.map((template) => (
              <Button
                key={template.key}
                variant="outline"
                onClick={() => useTemplate(template.key)}
                className="text-left justify-start p-4 text-sm bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-2 border-blue-200 hover:border-purple-300 rounded-xl transition-all duration-200 hover:scale-105"
                data-testid={`button-template-${template.key.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <span className="text-lg mr-3">{template.icon}</span>
                <span className="font-medium text-blue-700">{template.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="px-6 py-3 hover:bg-gray-50 transition-all duration-200"
          data-testid="button-back-to-upload"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Upload
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="btn-gradient-primary px-8 py-3 font-semibold rounded-xl hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          data-testid="button-generate-summary"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
              Generating...
            </>
          ) : (
            <>
              Generate Summary
              <Sparkles className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
