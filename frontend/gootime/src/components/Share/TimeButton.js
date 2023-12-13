import React from "react";
import { format } from "date-fns";

const TimeButton = ({ time, isSelected, onClick }) => {
  const handleButtonClick = () => {
    onClick(time);
  };

  return (
    <button
      className={`flex-grow min-w-1/2 max-w-1/2  bg-main-gray text-black text-md p-2 rounded m-1 duration-200 hover:bg-opacity-80 hover:shadow-lg ${
        isSelected ? "bg-main-yellow bg-opacity-100" : "bg-opacity-30"
      }`}
      onClick={handleButtonClick}
    >
      {`${format(new Date(time.start), "HH:mm")} - ${format(
        new Date(time.end),
        "HH:mm"
      )}`}
    </button>
  );
};

export default TimeButton;
