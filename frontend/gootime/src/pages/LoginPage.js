import React from "react";
import Image from "../middlewares/Image";
import GoogleLogin from "../components/Login/GoogleLogin";

const LoginPage = () => {
  return (
    <div
      id="login-page"
      className="flex flex-col items-center justify-center min-h-screen w-full"
    >
      <Image
        imageFileName="logo.svg"
        customStyle="shadow-xl hover:shadow-2xl rounded-full bg-white p-1"
      />
      <p className="mt-6 text-2xl">Sign in</p>
      <GoogleLogin isModal={false} />
    </div>
  );
};

export default LoginPage;
