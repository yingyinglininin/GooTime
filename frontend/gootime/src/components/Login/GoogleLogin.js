import React from "react";

const GoogleLogin = () => {
  const handleSignInWithGoogle = async () => {
    try {
      window.location.href = "https://www.gootimetw.com/api/auth/login";
      console.log("Redirect Success");
    } catch (error) {
      console.error("Redirect Failed");
    }
  };

  return (
    <button
      className="mt-6 px-8 py-2 bg-white rounded-lg border-2 border-solid	 border-black flex items-center cursor-pointer hover:bg-black hover:text-white"
      onClick={handleSignInWithGoogle}
    >
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
