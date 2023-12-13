import React, { useState } from "react";
import { Footer } from "../components/Footer";
import {
  ScheduleHeader,
  CreateStep,
  ScheduleStep,
  FinishStep,
} from "../components/Schedule";

const SchedulePage = () => {
  const [activeStep, setActiveStep] = useState(0);

  const handleStepClick = (step) => {
    setActiveStep(step);
  };

  const [shareLink, setShareLink] = useState("");

  const handleNextStep = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  return (
    <div id="schedule-page" className="flex flex-col h-full p-6">
      <ScheduleHeader activeStep={activeStep} onStepClick={handleStepClick} />
      <div className="flex-1 overflow-y-auto">
        {activeStep === 0 && (
          <CreateStep
            // eventInfo={eventInfo}
            // onEventInfoChange={handleEventInfoChange}
            onNextStep={handleNextStep}
          />
        )}
        {activeStep === 1 && (
          <ScheduleStep
            // eventInfo={eventInfo}
            onShareLinkChange={setShareLink}
            onNextStep={handleNextStep}
          />
        )}
        {activeStep === 2 && <FinishStep shareLink={shareLink} />}
      </div>
      <Footer />
    </div>
  );
};

export default SchedulePage;
