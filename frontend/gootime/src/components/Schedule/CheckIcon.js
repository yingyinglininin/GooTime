import React from "react";
import { FaCircle, FaCheck } from "react-icons/fa6";

const CheckIcon = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex items-center justify-center relative">
        <FaCircle size={50} className="text-main-yellow text-opacity-25" />
        <FaCheck
          size={30}
          className="text-main-yellow absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        />
      </div>
      <p className="mt-2 text-xl"> Finish </p>
    </div>
  );
};

export default CheckIcon;
