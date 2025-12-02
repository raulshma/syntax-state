"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  X,
  Target,
  Brain,
  CheckCircle2,
  BookOpen,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Briefcase,
  Code,
  Search,
  Rocket,
  Zap,
} from "lucide-react";
import { createLearningPath } from "@/lib/actions/learning-path";
import { useSharedHeader } from "@/components/dashboard/shared-header-context";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import { useIsMobile } from "@/hooks/use-mobile";

// Wizard Steps
const STEPS = [
  { id: "topic", title: "Topic", description: "Which technology or skill?" },
  { id: "level", title: "Level", description: "Choose your experience." },
  { id: "goal", title: "Goal", description: "What's your objective?" },
  { id: "focus", title: "Focus", description: "Specific areas to cover." },
  { id: "review", title: "Review", description: "Your personalized path." },
];

type WizardState = {
  topic: string;
  level: string;
  goal: string;
  focusAreas: string;
};

const INITIAL_STATE: WizardState = {
  topic: "",
  level: "",
  goal: "",
  focusAreas: "",
};

const SUGGESTED_TOPICS = [
  "React",
  "Python",
  "System Design",
  "Machine Learning",
  "AWS",
  "TypeScript",
];

const LEVELS = [
  {
    id: "beginner",
    title: "Beginner",
    description: "Just starting out",
    icon: BookOpen,
  },
  {
    id: "intermediate",
    title: "Intermediate",
    description: "Building confidence",
    icon: TrendingUp,
  },
  {
    id: "advanced",
    title: "Advanced",
    description: "Mastering the craft",
    icon: Brain,
  },
];

const GOALS = [
  {
    id: "interview",
    title: "Job Interview",
    description: "Ace your next role",
    icon: Briefcase,
  },
  {
    id: "project",
    title: "Build Project",
    description: "Create something new",
    icon: Rocket,
  },
  {
    id: "upskill",
    title: "Upskill",
    description: "Level up your career",
    icon: GraduationCap,
  },
  {
    id: "exam",
    title: "Certification",
    description: "Get certified",
    icon: CheckCircle2,
  },
];

export default function NewLearningPathPage() {
  const router = useRouter();
  const { setHeader } = useSharedHeader();
  const { isCollapsed } = useSidebar();
  const isMobile = useIsMobile();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<WizardState>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHeader({
      badge: "Learning Path",
      badgeIcon: BookOpen,
      title: "Start Your Learning Journey",
      description: "Create a personalized, adaptive learning path",
    });
  }, [setHeader]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const updateField = (field: keyof WizardState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    const prompt = `Create a learning path for ${formData.topic}. 
    My current level is ${formData.level}. 
    My goal is ${formData.goal}. 
    ${formData.focusAreas
        ? `Focus specifically on: ${formData.focusAreas}.`
        : ""
      }
    `;

    try {
      const result = await createLearningPath(prompt);
      if (result.success) {
        router.push(`/learning/${result.data._id}`);
      } else {
        setError(result.error.message);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.topic.trim().length > 0;
      case 1:
        return formData.level.length > 0;
      case 2:
        return formData.goal.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto px-6 md:px-12 pt-12 w-full pb-10">
        {/* Minimalist Header */}
        <div className="mb-8 md:mb-20 text-center">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-2 md:mb-3">
              {STEPS[currentStep].title}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground font-light">
              {STEPS[currentStep].description}
            </p>
          </motion.div>
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 mx-auto max-w-md flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto hover:bg-destructive/20 p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              className="w-full max-w-4xl"
            >
              {/* Step 1: Topic */}
              {currentStep === 0 && (
                <div className="flex flex-col items-center space-y-6 md:space-y-8">
                  <div className="relative w-full max-w-xl">
                    <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-5 md:w-6 h-5 md:h-6 text-muted-foreground/50" />
                    <Input
                      value={formData.topic}
                      onChange={(e) => updateField("topic", e.target.value)}
                      placeholder="Search topics (e.g. React, Python)..."
                      className="pl-14 md:pl-16 h-16 md:h-20 text-xl md:text-3xl bg-secondary/50 border-transparent focus:border-primary/20 rounded-3xl shadow-xs focus:ring-0 focus:bg-background transition-all"
                      autoFocus
                    />
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-2xl">
                    {SUGGESTED_TOPICS.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => updateField("topic", topic)}
                        className={cn(
                          "px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-medium transition-all duration-300",
                          formData.topic === topic
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                            : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground hover:scale-105"
                        )}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Level */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {LEVELS.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => updateField("level", level.id)}
                      className={cn(
                        "group relative p-6 md:p-8 rounded-[2rem] text-left transition-all duration-300 border-2 overflow-hidden",
                        formData.level === level.id
                          ? "border-primary bg-primary/5 shadow-xl shadow-primary/10 scale-[1.02]"
                          : "border-transparent bg-secondary/30 hover:bg-secondary/50 hover:scale-[1.02]"
                      )}
                    >
                      <div className="relative z-10 flex flex-col h-full">
                        <div
                          className={cn(
                            "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-4 md:mb-6 text-xl md:text-2xl transition-colors",
                            formData.level === level.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-background text-muted-foreground group-hover:text-foreground"
                          )}
                        >
                          <level.icon className="w-6 h-6 md:w-7 md:h-7" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold mb-2">
                          {level.title}
                        </h3>
                        <p className="text-sm md:text-base text-muted-foreground font-medium">
                          {level.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 3: Goal */}
              {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  {GOALS.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => updateField("goal", goal.id)}
                      className={cn(
                        "group relative p-6 md:p-8 rounded-[2rem] text-left transition-all duration-300 border-2 flex items-center gap-4 md:gap-6",
                        formData.goal === goal.id
                          ? "border-primary bg-primary/5 shadow-xl shadow-primary/10 scale-[1.02]"
                          : "border-transparent bg-secondary/30 hover:bg-secondary/50 hover:scale-[1.02]"
                      )}
                    >
                      <div
                        className={cn(
                          "w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                          formData.goal === goal.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground group-hover:text-foreground"
                        )}
                      >
                        <goal.icon className="w-6 h-6 md:w-8 md:h-8" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold mb-1">
                          {goal.title}
                        </h3>
                        <p className="text-sm md:text-base text-muted-foreground font-medium">
                          {goal.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 4: Focus */}
              {currentStep === 3 && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="relative">
                    <Textarea
                      value={formData.focusAreas}
                      onChange={(e) =>
                        updateField("focusAreas", e.target.value)
                      }
                      placeholder="Tell us specifically what you want to master..."
                      className="min-h-[180px] md:min-h-[240px] bg-secondary/30 border-transparent focus:border-primary/20 rounded-[2rem] p-6 md:p-8 text-lg md:text-xl resize-none shadow-xs focus:ring-0 focus:bg-background transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Lightbulb className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Optional: Adding details helps us personalize your path
                    </span>
                  </div>
                </div>
              )}

              {/* Step 5: Review */}
              {currentStep === 4 && (
                <div className="max-w-2xl mx-auto">
                  <div className="bg-secondary/30 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 space-y-8 border border-white/5">
                    <div className="space-y-6">
                      <div className="flex items-start justify-between border-b border-border/50 pb-6">
                        <div>
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Topic
                          </span>
                          <h3 className="text-3xl font-bold mt-1">
                            {formData.topic}
                          </h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentStep(0)}
                          className="rounded-full hover:bg-background/50"
                        >
                          Edit
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 border-b border-border/50 pb-6">
                        <div>
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Level
                          </span>
                          <p className="text-lg md:text-xl font-medium mt-1 capitalize">
                            {formData.level}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Goal
                          </span>
                          <p className="text-lg md:text-xl font-medium mt-1 capitalize">
                            {GOALS.find((g) => g.id === formData.goal)?.title ||
                              formData.goal}
                          </p>
                        </div>
                      </div>

                      {formData.focusAreas && (
                        <div>
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Focus Areas
                          </span>
                          <p className="text-lg mt-2 text-muted-foreground leading-relaxed">
                            {formData.focusAreas}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/10">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-foreground/80">
                        Our AI is ready to craft your personalized curriculum
                        based on these preferences.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Footer */}
      <div
        className="fixed bottom-0 right-0 p-4 md:p-6 bg-background/80 backdrop-blur-xl border-t border-border/50 z-50 transition-[left] duration-300 ease-in-out"
        style={{ left: isMobile ? 0 : isCollapsed ? "5rem" : "18rem" }}
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0 || isSubmitting}
            className={cn(
              "rounded-full px-4 py-4 md:px-6 md:py-6 text-sm md:text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all",
              currentStep === 0 && "opacity-0 pointer-events-none"
            )}
          >
            <ChevronLeft className="w-5 h-5 mr-1 md:mr-2" />
            Back
          </Button>

          {/* Progress Dots */}
          <div className="flex gap-3">
            {STEPS.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-300",
                  index === currentStep
                    ? "bg-primary scale-125"
                    : index < currentStep
                      ? "bg-primary/30"
                      : "bg-secondary"
                )}
              />
            ))}
          </div>

          {currentStep === STEPS.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-full px-6 py-3 md:px-10 md:py-7 text-sm md:text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 hover:scale-105 transition-all duration-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Start Learning
                  <Sparkles className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="rounded-full w-12 h-12 p-0 md:w-auto md:h-auto md:px-10 md:py-3 text-sm md:text-lg font-semibold bg-foreground text-background hover:bg-foreground/90 shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center"
            >
              <span className="hidden md:inline">Continue</span>
              <ChevronRight className="w-6 h-6 md:w-5 md:h-5 md:ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
