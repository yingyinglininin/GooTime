import React from "react";
import Image from "../../middlewares/Image";
import { format } from "date-fns";

const HomeHeader = ({ name }) => {
  return (
    <div className="flex flex-row justify-evenly items-center p-4 shadow-md bg-white z-50">
      <Image
        imageFileName="logo-home.svg"
        customStyle="shadow-xl hover:shadow-2xl rounded-full w-20 h-20"
      />
      <div className="flex flex-col items-center">
        <div className="mt-2 text-md">{"Today"}</div>
        <div className="mt-1 text-lg">{format(new Date(), "yyyy-MM-dd E")}</div>
        <div className="mt-2 text-2xl">{`Hi, ${name}`}</div>
      </div>
    </div>
  );
};

export default HomeHeader;
