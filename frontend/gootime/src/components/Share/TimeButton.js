import React from "react";
import { format } from "date-fns";

const TimeButton = ({ time, isSelected, onClick }) => {
  const handleButtonClick = () => {
    onClick(time);
  };

  const hasOverlap = time.hasOverlap || false;

  return (
    <button
      className={`flex-grow min-w-1/2 max-w-1/2 text-black text-md p-2 rounded m-1 duration-200 hover:shadow-lg ${
        isSelected
          ? "bg-main-yellow"
          : hasOverlap
          ? "bg-main-gray text-white"
          : "bg-main-green bg-opacity-80"
      }`}
      onClick={handleButtonClick}
      disabled={hasOverlap} // Disable the button if hasOverlap is true
    >
      {`${format(new Date(time.startTime), "HH:mm")} - ${format(
        new Date(time.endTime),
        "HH:mm"
      )}`}
    </button>
  );
};

export default TimeButton;
