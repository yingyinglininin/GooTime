import React from "react";

const ScheduleHeader = ({ activeStep, onStepClick }) => {
  const steps = ["Create", "Schedule", "Finish"];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white p-6 flex justify-center">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <div className="flex space-x-1 mt-2.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  onClick={() => onStepClick(index, i)}
                  className={`w-2 h-2 rounded-full transition ${
                    index <= activeStep && i < activeStep * 5
                      ? "bg-main-yellow hover:scale-110"
                      : "bg-main-gray bg-opacity-25"
                  }`}
                ></div>
              ))}
            </div>
          )}
          <div className="flex items-center flex-col">
            <div className="flex items-center justify-center">
              <div
                onClick={() => onStepClick(index)}
                className={`rounded-full w-6 h-6 transition ${
                  index <= activeStep
                    ? "bg-main-yellow cursor-pointer hover:scale-110"
                    : "bg-main-gray bg-opacity-25"
                }`}
              ></div>
            </div>
            <div className="mt-2 text-md">{step}</div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default ScheduleHeader;
