import React from "react";

const GoogleLogin = ({ isModal, link }) => {
  const handleSignInWithGoogle = async () => {
    try {
      const loginUrl = isModal
        ? // ? `http://localhost:4000/api/auth/login?source=sharepage&link=${link}`
          // : "http://localhost:4000/api/auth/login";
          `https://www.gootimetw.com/api/auth/login?source=sharepage&link=${link}`
        : "https://www.gootimetw.com/api/auth/login";

      // window.location.href = "https://www.gootimetw.com/api/auth/login";
      window.location.href = loginUrl;

      console.log("Redirect Success");
    } catch (error) {
      console.error("Redirect Failed");
    }
  };

  const buttonStyle = isModal
    ? "mt-6 mx-6 py-2 w-full bg-white rounded-lg border-2 border-solid border-black flex items-center justify-center cursor-pointer hover:bg-black hover:text-white whitespace-nowrap"
    : "mt-6 px-8 py-2 bg-white rounded-lg border-2 border-solid border-black flex items-center cursor-pointer hover:bg-black hover:text-white";

  return (
    <button className={buttonStyle} onClick={handleSignInWithGoogle}>
      <img
        className="mr-2"
        src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
        alt="Google Icon"
      />
      <span className="font-bold text-sm">Continue with Google</span>
    </button>
  );
};

export default GoogleLogin;
