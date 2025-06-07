import { useState, useEffect } from 'react';
import { X, ArrowRight, CheckCircle, Upload, Search, Zap } from 'lucide-react';

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
}

interface GuidedTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const TOUR_STEPS: Step[] = [
  {
    title: "Welcome to RecruiterCopilot.ai! 🎉",
    description: "Let's get you started with AI-powered resume matching. This quick tour will show you how to find perfect candidates in seconds.",
    icon: <Zap className="h-8 w-8 text-primary-500" />,
  },
  {
    title: "Step 1: Upload a Job Description",
    description: "Start by uploading a PDF or DOCX file with your job requirements. Our AI will extract key skills and requirements automatically.",
    icon: <Upload className="h-8 w-8 text-blue-500" />,
    action: "Upload your first job description below"
  },
  {
    title: "Step 2: Upload Candidate Resumes", 
    description: "Upload candidate resumes in PDF or DOCX format. The AI will parse their skills, experience, and background.",
    icon: <Upload className="h-8 w-8 text-green-500" />,
    action: "Upload candidate resumes"
  },
  {
    title: "Step 3: Run AI Analysis",
    description: "Our AI compares candidates against job requirements and gives you match scores, top skills, and personalized outreach messages.",
    icon: <Search className="h-8 w-8 text-purple-500" />,
    action: "Click 'Analyze Match' when ready"
  },
  {
    title: "You're All Set! 🚀",
    description: "That's it! You can now upload multiple jobs and candidates, run analyses, and find the perfect matches. Happy recruiting!",
    icon: <CheckCircle className="h-8 w-8 text-green-500" />,
  }
];

function GuidedTour({ onComplete, onSkip }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if user has seen the tour before
    const hasSeenTour = localStorage.getItem('recruiter_tour_completed');
    if (hasSeenTour) {
      setIsVisible(false);
      onComplete();
    }
  }, [onComplete]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('recruiter_tour_completed', 'true');
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem('recruiter_tour_completed', 'true');
    setIsVisible(false);
    onSkip();
  };

  if (!isVisible) return null;

  const currentStepData = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-up">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-3">
            {currentStepData.icon}
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div 
                  className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <button 
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {currentStepData.title}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {currentStepData.description}
          </p>
          {currentStepData.action && (
            <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
              <p className="text-primary-700 font-medium text-sm">
                👉 {currentStepData.action}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 font-medium text-sm"
          >
            Skip Tour
          </button>
          
          <div className="flex space-x-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center space-x-2"
            >
              <span>{isLastStep ? 'Get Started' : 'Next'}</span>
              {!isLastStep && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuidedTour; 