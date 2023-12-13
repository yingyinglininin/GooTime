import React, { useState, useEffect } from "react";
import { DigitalClock, MultiSectionDigitalClock } from "@mui/x-date-pickers";
import PreferenceCheckbox from "./PreferenceCheckbox";
import ScheduleSelector from "./ScheduleSelector";
import LoadingSpinner from "../LoadingSpinner";

import axios from "axios";
const { parseISO } = require("date-fns");

const CreateStepComponent = ({ onNextStep }) => {
  // Initialize data from localStorage
  const storedTempEvent = JSON.parse(localStorage.getItem("tempEvent")) || {};

  const [tempEvent, setTempEvent] = useState({
    eventName: storedTempEvent.eventName || "",
    selectedDuration: storedTempEvent.selectedDuration
      ? parseISO(storedTempEvent.selectedDuration)
      : null,
    selectedSchedule: storedTempEvent.selectedSchedule || "",
    selectedPreferences: storedTempEvent.selectedPreferences || [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("tempEvent", JSON.stringify(tempEvent));
  }, [tempEvent]);

  const handleEventNameChange = (e) => {
    const updatedEventName = e.target.value;
    setTempEvent((prevEvent) => ({
      ...prevEvent,
      eventName: updatedEventName,
    }));
  };

  const handleTimeChange = (time) => {
    setTempEvent((prevEvent) => ({
      ...prevEvent,
      selectedDuration: time,
    }));
  };

  const handleScheduleChange = (value) => {
    setTempEvent((prevEvent) => ({
      ...prevEvent,
      selectedSchedule: value.toLocaleDateString(),
    }));
  };

  const handlePreferenceChange = (values) => {
    const preferenceString = values.map((item) => item.title);
    setTempEvent((prevEvent) => ({
      ...prevEvent,
      selectedPreferences: preferenceString,
    }));
  };

  const handleScheduleClick = async () => {
    try {
      setLoading(true);

      const totalMinutes =
        tempEvent.selectedDuration.getHours() * 60 +
        tempEvent.selectedDuration.getMinutes();

      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const userId = userInfo.id;

      // Perform post request for available API
      const postData = {
        id: userId,
        duration: totalMinutes,
        finalDate: tempEvent.selectedSchedule,
        preference: tempEvent.selectedPreferences,
      };
      console.log(totalMinutes);
      console.log(tempEvent.selectedSchedule);
      console.log(tempEvent.selectedPreferences);

      const availableApiResponse = await axios.post(
        "https://www.gootimetw.com/api/1.0.0/schedule/available",
        // "http://localhost:4000/api/1.0.0/schedule/available",
        postData,
        {
          headers: {
            "Content-Type": "application/json", // Include the appropriate content type
          },
        }
      );

      localStorage.setItem(
        "availableApiResponse",
        JSON.stringify(availableApiResponse.data)
      );

      console.log("Available API Response:", availableApiResponse.data);

      onNextStep();
    } catch (error) {
      console.error("Error during scheduling:", error);
    }
  };

  return (
    <div className="flex flex-col space-y-2 mt-20 mb-16">
      <label>Event Name</label>
      <input
        type="text"
        name="eventName"
        className="bg-main-yellow bg-opacity-30 border-l-8 border-main-yellow rounded-md cursor-pointer h-10 pl-2 text-lg"
        value={tempEvent.eventName}
        onChange={handleEventNameChange}
      />

      <label>How long will it take?</label>
      <DigitalClock
        className="flex items-center h-full"
        ampm={false}
        value={tempEvent.selectedDuration}
        onChange={handleTimeChange}
      />

      <label>How soon to schedule?</label>
      <ScheduleSelector setSelectedDate={handleScheduleChange} />
      <label>Preference</label>
      <PreferenceCheckbox onPreferenceChange={handlePreferenceChange} />
      <button
        className=" bg-main-yellow bg-opacity-90 rounded-md h-10 left-4 right-4 bottom-24 hover:shadow-md hover:bg-opacity-100"
        onClick={handleScheduleClick}
      >
        {loading && <LoadingSpinner />}
        Schedule
      </button>
    </div>
  );
};

export default CreateStepComponent;
