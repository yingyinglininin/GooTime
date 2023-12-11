import React from "react";
import { IoTime } from "react-icons/io5";

const TimeDisplay = ({ duration }) => (
  <div className="mb-4 flex items-center justify-center">
    <IoTime className=" text-main-gray mr-2" />
    <p className="text-xl">{formatDuration(duration)}</p>
  </div>
);

const formatDuration = (minutes) => {
  if (minutes === 0) {
    return "";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
};

export default TimeDisplay;
