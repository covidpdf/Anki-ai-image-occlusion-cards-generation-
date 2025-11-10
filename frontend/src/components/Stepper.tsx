interface Step {
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="stepper">
      {steps.map((step, index) => (
        <div key={index} className="stepper-item">
          <div className="stepper-step">
            <div
              className={`stepper-circle ${
                index < currentStep
                  ? 'completed'
                  : index === currentStep
                    ? 'active'
                    : ''
              }`}
            >
              {index < currentStep ? (
                <svg
                  className="stepper-check"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <span className="stepper-number">{index + 1}</span>
              )}
            </div>
            <div className="stepper-content">
              <div
                className={`stepper-label ${index === currentStep ? 'active' : ''}`}
              >
                {step.label}
              </div>
              {step.description && (
                <div className="stepper-description">{step.description}</div>
              )}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`stepper-line ${index < currentStep ? 'completed' : ''}`}
            />
          )}
        </div>
      ))}
    </div>
  );
};
