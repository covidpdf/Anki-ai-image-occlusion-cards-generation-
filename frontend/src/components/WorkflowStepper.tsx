interface WorkflowStepperProps {
  currentStep: number;
  steps: string[];
}

export function WorkflowStepper({ currentStep, steps }: WorkflowStepperProps) {
  return (
    <div className="stepper">
      {steps.map((step, index) => (
        <div key={index} className={`step-indicator ${currentStep >= index ? 'active' : ''}`}>
          <div className="step-number" aria-current={currentStep === index}>
            {index + 1}
          </div>
          <div className="step-label">{step}</div>
        </div>
      ))}
    </div>
  );
}
