'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Target, TrendingUp, Shield, BarChart3, PieChart, Activity, CheckCircle2 } from 'lucide-react'

type Step = {
  id: string
  title: string
  subtitle: string
  options: {
    id: string
    title: string
    description: string
    icon: any
  }[]
}

const ONBOARDING_STEPS: Step[] = [
  {
    id: 'experience',
    title: 'What is your investment experience?',
    subtitle: 'This helps us tailor the analytics complexity to your needs.',
    options: [
      { id: 'beginner', title: 'Beginner', description: 'Just starting to learn about risk and volatility.', icon: PieChart },
      { id: 'intermediate', title: 'Intermediate', description: 'Familiar with basic portfolio construction.', icon: BarChart3 },
      { id: 'advanced', title: 'Advanced', description: 'Experienced with quantitative models and greeks.', icon: Activity },
    ]
  },
  {
    id: 'goal',
    title: 'What is your primary objective?',
    subtitle: 'We will optimize the dashboard to focus on your main goals.',
    options: [
      { id: 'preservation', title: 'Wealth Preservation', description: 'Protect capital and minimize severe drawdowns.', icon: Shield },
      { id: 'growth', title: 'Aggressive Growth', description: 'Maximize returns, accepting higher volatility.', icon: TrendingUp },
      { id: 'income', title: 'Balanced/Income', description: 'Steady growth with reasonable risk controls.', icon: Target },
    ]
  },
  {
    id: 'risk',
    title: 'How do you react to a 20% market drop?',
    subtitle: 'Understanding your risk tolerance is key to proper modeling.',
    options: [
      { id: 'sell', title: 'Sell to protect', description: 'I want to limit further losses immediately.', icon: Shield },
      { id: 'hold', title: 'Hold steady', description: 'I understand markets fluctuate and will wait it out.', icon: PieChart },
      { id: 'buy', title: 'Buy more', description: 'I see it as an opportunity to add at lower prices.', icon: TrendingUp },
    ]
  }
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [direction, setDirection] = useState(1) // 1 for forward, -1 for backward
  const [isCompleting, setIsCompleting] = useState(false)

  const currentStep = ONBOARDING_STEPS[currentStepIndex]
  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1

  const handleOptionSelect = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [currentStep.id]: optionId }))
  }

  const handleNext = () => {
    if (!answers[currentStep.id]) return

    if (isLastStep) {
      handleComplete()
    } else {
      setDirection(1)
      setCurrentStepIndex(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setDirection(-1)
      setCurrentStepIndex(prev => prev - 1)
    }
  }

  const handleComplete = () => {
    setIsCompleting(true)
    // Simulate finalizing setup with a slight delay
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  }

  const slideVariants = {
    hidden: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95
    }),
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" as const }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3, ease: "easeIn" as const }
    })
  }

  if (isCompleting) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Setup Complete</h2>
          <p className="text-zinc-400">Personalizing your risk lab...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none" />
      
      <div className="max-w-2xl mx-auto w-full relative z-10 flex-grow flex flex-col">
        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-zinc-400">Step {currentStepIndex + 1} of {ONBOARDING_STEPS.length}</span>
            <button 
              onClick={() => router.push('/dashboard')}
              className="text-sm text-zinc-500 hover:text-white transition-colors"
            >
              Skip
            </button>
          </div>
          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
            <motion.div 
              initial={false}
              animate={{ width: `${((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        <div className="flex-grow flex flex-col">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStepIndex}
              custom={direction}
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-grow flex flex-col"
            >
              <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{currentStep.title}</h1>
                <p className="text-lg text-zinc-400">{currentStep.subtitle}</p>
              </div>

              <div className="space-y-4">
                {currentStep.options.map((option) => {
                  const isSelected = answers[currentStep.id] === option.id
                  const Icon = option.icon
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(option.id)}
                      className={`w-full flex items-center p-6 rounded-2xl border transition-all duration-300 text-left ${
                        isSelected 
                          ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)] transform scale-[1.02]' 
                          : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className={`mr-6 p-4 rounded-xl flex-shrink-0 transition-colors ${
                        isSelected ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className={`text-xl font-semibold mb-1 transition-colors ${
                          isSelected ? 'text-white' : 'text-zinc-200'
                        }`}>{option.title}</h3>
                        <p className={`transition-colors ${
                          isSelected ? 'text-indigo-200' : 'text-zinc-500'
                        }`}>{option.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-12 flex items-center justify-between pt-6 border-t border-zinc-900">
          <button
            onClick={handleBack}
            className={`px-6 py-3 text-zinc-400 font-medium transition-colors hover:text-white ${
              currentStepIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            Back
          </button>
          
          <button
            onClick={handleNext}
            disabled={!answers[currentStep.id]}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all ${
              answers[currentStep.id] 
                ? 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-lg hover:shadow-xl' 
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {isLastStep ? 'Complete Setup' : 'Continue'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
