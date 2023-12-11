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
  const [attendeeName, setAttendeeName] = useState(null);
  const [attendeeEmail, setAttendeeEmail] = useState(null);

  useEffect(() => {
    // Fetch available time data based on the link
    const fetchAvailableTime = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/1.0.0/schedule/available/${link}`
        );
        console.log(response.data);

        setScheduleData(response.data);

        // Assuming that the API response structure includes an `availableTimes` property
        setAvailableTimes(response.data.timeSlots);
      } catch (error) {
        console.error("Error fetching available time:", error);
      }
    };

    fetchAvailableTime();
  }, [link]);

  useEffect(() => {
    // Update available times for the selected day when selectedDateTime changes
    const timesForSelectedDay = availableTimes.filter((time) =>
      dayjs(time.start).isSame(selectedDateTime, "day")
    );
    setAvailableTimesForSelectedDay(timesForSelectedDay);
  }, [selectedDateTime, availableTimes]);

  const handleTimeSelect = (dateTime) => {
    setSelectedDateTime(dateTime);
  };

  const handleTimeSlotSelect = (dateTime) => {
    setSelectedTimeSlot(dateTime);
  };

  const openPopupModal = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Enter your information",
      html: `
        <input id="swal-input-name" class="swal2-input" placeholder="Your Name">
        <input id="swal-input-email" class="swal2-input" placeholder="Your Email" type="email">
      `,
      focusConfirm: false,
      preConfirm: () => {
        const name = document.getElementById("swal-input-name").value;
        const email = document.getElementById("swal-input-email").value;

        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name || !email || !emailRegex.test(email)) {
          Swal.showValidationMessage(
            "Please enter a valid name and email address"
          );
          return false; // Returning false prevents the modal from closing
        }

        // Return values if both name and valid email are provided
        return [name, email];
      },
    });

    if (formValues) {
      const [name, email] = formValues;
      // Update state variables or take other actions with the obtained form values
      setAttendeeName(name);
      setAttendeeEmail(email);
    } else {
      // Handle dismissal or if the user didn't provide valid input
      console.log("Form not submitted");
    }
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
    // Open the pop-up modal to get attendee information
    await openPopupModal();

    // Continue with the rest of the handleSubmit logic
    try {
      setIsSubmitting(true);
      const endTime = addMinutes(
        new Date(selectedTimeSlot),
        scheduleData?.duration
      );

      // Assuming you have an API endpoint to handle the submission
      const response = await axios.post(
        "http://localhost:4000/api/1.0.0/schedule/submit",
        {
          link,
          startTime: format(new Date(selectedTimeSlot), "yyyy-MM-dd HH:mm:ss"),
          endTime: format(endTime, "yyyy-MM-dd HH:mm:ss"),
          attendeeName,
          attendeeEmail,
        }
      );
      console.log("google calendar reservation link:", response.data);
      Swal.fire({
        icon: "success",
        title: "時間預約成功",
      });
    } catch (error) {
      console.error("Error submitting time slot:", error);
      Swal.fire({
        icon: "error",
        title: "時間預約失敗",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="share-page" className="flex flex-col items-center p-4 pt-12 pb-16">
      <UserInformation user={scheduleData?.user} />
      <span className="text-xl mb-2">
        {scheduleData?.name || "Unknown Event"}
      </span>
      <TimeDisplay duration={scheduleData?.duration} />
      <ReserveCalendar
        onTimeSelect={handleTimeSelect}
        availableTimes={availableTimes}
      />
      <div className="flex flex-row items-start">
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
    </div>
  );
};

export default SharePage;
