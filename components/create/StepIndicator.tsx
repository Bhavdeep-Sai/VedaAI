'use client';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

export function StepIndicator({ totalSteps, currentStep }: StepIndicatorProps) {
  return (
    <div className="step-bar w-full">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={`step-segment ${i < currentStep ? 'active' : ''}`}
        />
      ))}
    </div>
  );
}
