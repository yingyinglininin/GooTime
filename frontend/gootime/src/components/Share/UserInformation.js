import React from "react";

const UserInformation = ({ user }) => (
  <div className="flex flex-col items-center mb-2 space-y-2">
    <img
      src={user?.picture || "/images/logo.png"}
      alt="User Image"
      className="w-16 h-16 rounded-full mr-2"
    />
    <span className="text-2xl font-bold">{user?.name || "GooTime"}</span>
  </div>
);

export default UserInformation;
