import React, { useEffect, useState } from "react";
import axios from "axios";
import { Footer } from "../components/Footer";
import {
  HomeHeader,
  MyScheduleTab,
  OtherScheduleTab,
} from "../components/Home";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom"; // Make sure to import useNavigate

const HomePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("mySchedule");
  const [urlToken, setUrlToken] = useState(null);

  console.log(userData);
  useEffect(() => {
    const checkToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get("token");

      // Check if token is present in URL, otherwise check localStorage
      if (tokenFromUrl) {
        await fetchData(tokenFromUrl);
        setUrlToken(tokenFromUrl);
        localStorage.setItem("authToken", tokenFromUrl);
      } else {
        const authTokenFromLocalStorage = localStorage.getItem("authToken");
        if (authTokenFromLocalStorage) {
          await fetchData(authTokenFromLocalStorage);
          setUrlToken(authTokenFromLocalStorage);
        }
      }
    };

    checkToken();
  }, []);

  const fetchData = async (token) => {
    try {
      const response = await axios.get(
        "https://www.gootimetw.com/api/1.0.0/user/name",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserData(response.data);
      setLoading(false);
      localStorage.setItem("userInfo", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching user data:", error);

      // if (error.response && error.response.status === 401) {
      //   // Token expired or invalid, try refreshing the token
      //   const refreshedToken = await refreshToken(); // Implement refreshToken function
      //   if (refreshedToken) {
      //     // If refresh is successful, retry fetching data
      //     await fetchData(refreshedToken);
      //   } else {
      //     // If refresh fails, navigate to login page
      //     navigate("/");
      //   }
      // } else {
      //   // Other errors, navigate to login page
      //   navigate("/");
      // }
    }
  };

  // Function to refresh the token
  const refreshToken = async () => {
    try {
      const response = await axios.post(
        "https://www.gootimetw.com/api/1.0.0/user/auth/refresh",
        {
          // Include necessary data for token refresh, if required
        }
      );
      const newToken = response.data.access_token;
      // Update the localStorage or state with the new token
      localStorage.setItem("authToken", newToken);
      return newToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  };

  return (
    <div className="relative">
      <div className="fixed top-0 left-0 right-0 z-50">
        <HomeHeader name={userData?.name} />
        {/* Tabs */}
        <div className="flex justify-center space-x-0">
          <button
            className={`${
              selectedTab === "mySchedule"
                ? "bg-main-yellow text-black"
                : "bg-main-gray text-white"
            } flex-1 px-4 py-2 rounded duration-300 hover:shadow-xl opacity-100`}
            onClick={() => setSelectedTab("mySchedule")}
          >
            My Schedule
          </button>
          <button
            className={`${
              selectedTab === "otherSchedule"
                ? "bg-main-yellow text-black"
                : "bg-main-gray text-white"
            } flex-1 px-4 py-2 rounded duration-300 hover:shadow-xl opacity-100`}
            onClick={() => setSelectedTab("otherSchedule")}
          >
            Other Schedule
          </button>
        </div>
      </div>
      {/* Content */}
      {!loading ? (
        <div className="p-4 mt-64 mb-32 overflow-y-auto">
          {selectedTab === "mySchedule" ? (
            <MyScheduleTab token={urlToken} />
          ) : (
            <OtherScheduleTab token={urlToken} />
          )}
        </div>
      ) : (
        <LoadingSpinner />
      )}

      <Footer />
    </div>
  );
};

export default HomePage;
