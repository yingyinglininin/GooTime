import React from "react";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";

const LoadingSkeleton = ({ isLoading }) => (
  <div className="animate-pulse flex flex-col items-center p-4 pt-12 pb-4">
    {/* Image Placeholder */}
    <div className="rounded-full bg-main-gray opacity-25  h-16 w-16 mb-4"></div>

    {/* Grid Placeholder */}
    <div className="grid grid-row-3 gap-4 w-full space-y-1  mb-10">
      {/* First column */}
      <div className="flex flex-col items-center">
        <div className="h-4 bg-main-gray opacity-25 rounded w-1/3"></div>
      </div>

      {/* Second column */}
      <div className="flex flex-col items-center">
        <div className="h-4 bg-main-gray opacity-25 rounded w-1/4"></div>
      </div>

      {/* Third column */}
      <div className="flex flex-col items-center">
        <div className="h-4 bg-main-gray opacity-25 rounded w-1/4"></div>
      </div>
    </div>

    {/* Centered DayCalendarSkeleton */}
    <div className="flex flex-col items-center">
      <DayCalendarSkeleton />
    </div>
  </div>
);

export default LoadingSkeleton;
