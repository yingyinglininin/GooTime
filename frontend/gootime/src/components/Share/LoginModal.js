import React from "react";
import Image from "../../middlewares/Image";
import GoogleLogin from "../Login/GoogleLogin";

const LoginModal = ({ link, onClose }) => {
  const handleWithoutLogin = () => {
    console.log("Use Without Login");
    onClose();
  };

  return (
    <div>
      <div
        id="login-modal"
        className="flex flex-col items-center fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white pl-16 pr-16 pt-28 pb-28 rounded-lg shadow-xl z-50"
      >
        <Image
          imageFileName="logo.svg"
          customStyle="shadow-xl hover:shadow-2xl rounded-full bg-white p-1"
        />
        <p className="mt-6 text-2xl">Sign in</p>
        <GoogleLogin isModal={true} link={link} />

        <button
          className="mt-2 p-2 pl-6 pr-6 bg-white rounded-lg border-2 border-solid border-black flex items-center cursor-pointer hover:bg-main-yellow hover:text-black"
          onClick={handleWithoutLogin}
        >
          <span className="font-bold text-sm">Continue without login</span>
        </button>
      </div>
      <div className="fixed top-0 left-0 w-full h-full bg-black opacity-50 z-40"></div>
    </div>
  );
};

export default LoginModal;
