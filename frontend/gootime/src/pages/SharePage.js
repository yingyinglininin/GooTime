import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import {
  UserInformation,
  TimeDisplay,
  ReserveCalendar,
  TimeButtonGroup,
  Footer,
  LoginModal,
  LoadingSkeleton,
} from "../components/Share";
import Swal from "sweetalert2";
import { IoMdArrowRoundBack } from "react-icons/io";

const { format, addMinutes } = require("date-fns");

const SharePage = () => {
  const { link } = useParams();
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState([]);
  const [availableTimesForSelectedDay, setAvailableTimesForSelectedDay] =
    useState([]); // Define state for available times on the selected day
  const [scheduleData, setScheduleData] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // To track whether submission is in progress
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [urlToken, setUrlToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Update available times for the selected day when selectedDateTime changes
    const timesForSelectedDay = availableTimes.filter((time) =>
      dayjs(time.startTime).isSame(selectedDateTime, "day")
    );
    setAvailableTimesForSelectedDay(timesForSelectedDay);
  }, [selectedDateTime, availableTimes]);

  // Fetch available time data based on the link and optional token
  const fetchAvailableTime = async (tokenToUse = "") => {
    try {
      const response = await axios.get(
        // `http://localhost:4000/api/1.0.0/schedule/available/${link}?token=${tokenToUse}`
        `https://www.gootimetw.com/api/1.0.0/schedule/available/${link}?token=${tokenToUse}`
      );

      setScheduleData(response.data);
      setAvailableTimes(response.data.timeSlots);
    } catch (error) {
      console.error("Error fetching available time:", error);
    }
  };

  const fetchUserInfo = async (token) => {
    try {
      const response = await axios.get(
        "https://www.gootimetw.com/api/1.0.0/user/name",
        // "http://localhost:4000/api/1.0.0/user/name",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserData(response.data);
      localStorage.setItem("userInfo", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      setIsLoading(true);

      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get("token");
      const storedToken = localStorage.getItem("authToken");
      const tokenToUse = storedToken || tokenFromUrl;

      if (window.location.pathname.startsWith("/share")) {
        if (tokenToUse) {
          await fetchAvailableTime(tokenToUse);
          setUrlToken(tokenToUse);
          localStorage.setItem("authToken", tokenToUse);
          await fetchUserInfo(tokenToUse);
          setShowLoginModal(false);
        } else {
          await fetchAvailableTime();
          setShowLoginModal(true);
        }
      } else {
        setShowLoginModal(false);
        await fetchAvailableTime();
      }

      setIsLoading(false);
    };

    checkToken();
  }, []);

  const handleTimeSelect = (dateTime) => {
    setSelectedDateTime(dateTime);
  };

  const handleTimeSlotSelect = (dateTime) => {
    setSelectedTimeSlot(dateTime);
  };

  const handleShare = () => {
    // Check if Web Share API is supported
    if (navigator.share) {
      navigator
        .share({
          title: "Share Event",
          text: `Check out this event: ${window.location.href.replace(
            "/preview/",
            "/share/"
          )}`,
        })
        .then(() => console.log("Shared successfully"))
        .catch((error) => console.error("Error sharing:", error));
    } else {
      try {
        // Copy modified link to clipboard
        const modifiedLink = window.location.href.replace(
          "/preview/",
          "/share/"
        );
        const textarea = document.createElement("textarea");
        textarea.value = modifiedLink;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);

        Swal.fire({
          icon: "success",
          title: "成功加入剪貼簿",
        });
      } catch {
        Swal.fire({
          icon: "error",
          title: "加入剪貼簿失敗",
        });
      }
    }
  };

  const handleSubmit = async () => {
    const storedUserInfo = localStorage.getItem("userInfo");

    let name, email;

    if (storedUserInfo) {
      const userInfo = JSON.parse(storedUserInfo);
      name = userInfo.name;
      email = userInfo.email;
    } else {
      const { value: formValues } = await Swal.fire({
        title: "Enter your information",
        html: `
          <input id="swal-input-name" class="swal2-input" placeholder="Your name">
          <input id="swal-input-email" class="swal2-input" placeholder="Your email" type="email">
        `,
        focusConfirm: false,
        preConfirm: () => {
          name = document.getElementById("swal-input-name").value;
          email = document.getElementById("swal-input-email").value;

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

          if (!name || !email || !emailRegex.test(email)) {
            Swal.showValidationMessage(
              "Please enter a valid name and email address"
            );
            return false; // Returning false prevents the modal from closing
          }
          return [name, email];
        },
      });

      if (!formValues) {
        console.log("Form not submitted");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const endTime = addMinutes(
        new Date(selectedTimeSlot),
        scheduleData?.duration
      );

      const response = await axios.post(
        "https://www.gootimetw.com/api/1.0.0/schedule/submit",
        // "http://localhost:4000/api/1.0.0/schedule/submit",
        {
          link,
          startTime: format(new Date(selectedTimeSlot), "yyyy-MM-dd HH:mm:ss"),
          endTime: format(endTime, "yyyy-MM-dd HH:mm:ss"),
          attendeeName: name,
          attendeeEmail: email,
        }
      );
      console.log("google calendar reservation link:", response.data);
      Swal.fire({
        icon: "success",
        title: "Success",
      });
    } catch (error) {
      console.error("Error submitting time slot:", error);
      Swal.fire({
        icon: "error",
        title: "Failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (showLoginModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [showLoginModal]);

  return isLoading ? (
    <LoadingSkeleton isLoading={isLoading} />
  ) : (
    <div id="share-page" className="flex flex-col items-center p-4 pt-12 pb-20">
      <UserInformation user={scheduleData?.user} />
      <span className="text-xl mb-2">{scheduleData?.name || ""}</span>
      <TimeDisplay duration={scheduleData?.duration} />
      <ReserveCalendar
        onTimeSelect={handleTimeSelect}
        availableTimes={availableTimes}
      />
      <div className="flex flex-row items-center pb-2">
        {availableTimesForSelectedDay.length === 0 ? (
          <p>No available times for the selected day.</p>
        ) : (
          <TimeButtonGroup
            availableTimesForSelectedDay={availableTimesForSelectedDay}
            handleTimeSelect={handleTimeSlotSelect}
          />
        )}
      </div>
      <Footer
        selectedTimeSlot={selectedTimeSlot}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        handleShare={handleShare}
      />
      {window.location.pathname.startsWith("/preview") && (
        <Link to="/home">
          <IoMdArrowRoundBack
            className="fixed top-4 left-4 text-main-gray hover:text-main-yellow"
            size={50}
          />
        </Link>
      )}
      {window.location.pathname.startsWith("/share") && showLoginModal && (
        <LoginModal link={link} onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
};

export default SharePage;
