import { CheckCircle } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
}

const steps = [
  { number: 1, title: "Upload Transcript" },
  { number: 2, title: "Add Instructions" },
  { number: 3, title: "Generate & Edit" },
  { number: 4, title: "Share Summary" }
];

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  return (
    <div className="mb-10" data-testid="progress-indicator">
      <div className="flex items-center justify-between text-sm">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex items-center space-x-3" data-testid={`step-${step.number}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                step.number < currentStep
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white animate-pulse-glow'
                  : step.number === currentStep
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white animate-glow'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step.number < currentStep ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  step.number
                )}
              </div>
              <span className={`font-semibold transition-colors duration-300 ${
                step.number < currentStep 
                  ? 'text-green-600'
                  : step.number === currentStep 
                  ? 'text-purple-600 shimmer-text' 
                  : 'text-gray-500'
              }`}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 rounded-full mx-6 hidden md:block transition-all duration-500 ${
                step.number < currentStep 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse-glow'
                  : 'bg-gray-200'
              }`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
