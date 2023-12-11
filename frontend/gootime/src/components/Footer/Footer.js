import React from "react";
import { HiHome } from "react-icons/hi";
import { FaCirclePlus } from "react-icons/fa6";
import { IoPersonCircleOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const handleNavigate = (route) => {
    navigate(route);
  };

  return (
    <div className="flex items-center justify-center space-x-20 fixed bottom-0 left-0 right-0 bg-white shadow-2xl p-4 z-50">
      <HiHome
        size={36}
        className="flex-shrink-0 cursor-pointer hover:scale-110"
        onClick={() => handleNavigate("/home")}
      />
      <FaCirclePlus
        size={50}
        className="text-main-yellow flex-shrink-0 rounded-full shadow-xl hover:shadow-2xl cursor-pointer hover:scale-110"
        onClick={() => handleNavigate("/schedule")}
      />
      <IoPersonCircleOutline
        size={38}
        className="flex-shrink-0 cursor-pointer  hover:scale-110"
        onClick={() => handleNavigate("/profile")}
      />
    </div>
  );
};

export default Footer;
