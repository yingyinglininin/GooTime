import React, { useRef } from "react";
import CheckIcon from "./CheckIcon";
import { FaClone } from "react-icons/fa6";
import { Link } from "react-router-dom";

const Swal = require("sweetalert2");

const FinishStep = ({ shareLink }) => {
  const textRef = useRef(null);

  const handleCopy = async () => {
    try {
      // Use the Clipboard API to copy text
      await navigator.clipboard.writeText(textRef.current.innerText);
      Swal.fire({
        icon: "success",
        title: "成功加入剪貼簿",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "加入剪貼簿失敗",
      });
    }
  };

  const previewLink = shareLink.replace("/share", "/preview");

  return (
    <div className="space-y-4 mt-24">
      <CheckIcon />
      <div className="flex items-center relative bg-main-yellow bg-opacity-30 border-l-8 border-main-yellow rounded-md pl-2 cursor-pointer hover:border-main-green hover:bg-main-green hover:bg-opacity-30 duration-300 overflow-hidden">
        <div
          className="flex items-center text-sm overflow-x-auto whitespace-nowrap h-10  "
          ref={textRef}
          onClick={handleCopy}
        >
          {shareLink}
        </div>
        <span className=" p-2 cursor-pointer">
          <FaClone
            className="text-main-gray text-opacity-75"
            size={20}
            onClick={handleCopy}
          />
        </span>
      </div>
      <Link to={previewLink}>
        <button className="fixed bg-main-yellow rounded-md h-10 left-4 right-4 bottom-24 hover:shadow-md">
          Preview
        </button>
      </Link>
    </div>
  );
};

export default FinishStep;
