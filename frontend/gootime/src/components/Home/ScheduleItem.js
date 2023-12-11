import React from "react";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { GrStatusGood } from "react-icons/gr";
import { MdFlightTakeoff } from "react-icons/md";
import { MdFlightLand } from "react-icons/md";
import { IoTime } from "react-icons/io5";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const ScheduleItem = ({ schedule }) => (
  <div className="border border-main-gray bg-white shadow-lg rounded-2xl p-4 mb-4 relative">
    <p className="text-xl font-bold mb-2">{schedule.name}</p>
    <div className="flex justify-between items-center mb-2 mr-24">
      <div>
        <div className="flex flew-row justify-start items-center mb-1">
          <IoTime className=" text-main-gray mr-2" size={18} />
          <p className="text-main-gray">{formatDuration(schedule.duration)}</p>
        </div>
        <div className="flex flew-row justify-start items-center">
          <GrStatusGood className=" text-main-gray mr-2" size={16} />
          <p className="text-main-gray">
            {schedule.status === "done" ? "Done" : "Pending"}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="flex flew-row justify-start items-center mb-1">
          <MdFlightTakeoff className=" text-main-gray mr-2" size={18} />
          <p className="text-main-gray">
            {schedule.finalStartTime
              ? `${format(
                  new Date(schedule.finalStartTime),
                  "yyyy-MM-dd HH:mm"
                )}`
              : `${format(new Date(), "yyyy-MM-dd")}`}
          </p>
        </div>
        <div className="flex flew-row justify-start items-center">
          <MdFlightLand className=" text-main-gray mr-2" size={18} />
          <p className="text-main-gray">
            {schedule.finalEndTime
              ? `${format(new Date(schedule.finalEndTime), "yyyy-MM-dd HH:mm")}`
              : `${format(new Date(schedule.finalDate), "yyyy-MM-dd")}`}
          </p>
        </div>
      </div>
      {/* Vertical dashed line */}
      <div className="absolute top-0 right-1/4 h-full border-r border-dashed border-main-gray border-opacity-50"></div>
      {/* Circle */}
      <div className="absolute right-0 transform -translate-x-1/2 translate-y-1/2 mb-10">
        <Link to={`http://localhost:3000/preview/${schedule.link}`}>
          {/* Replace with your actual link */}
          <IoIosArrowDroprightCircle
            className="text-main-gray cursor-pointer hover:text-main-yellow"
            size={50}
          />
        </Link>
      </div>
    </div>
    {/* Additional details if needed */}
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

export default ScheduleItem;
