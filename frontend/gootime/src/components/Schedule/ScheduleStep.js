import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Datepicker } from "@meinefinsternis/react-horizontal-date-picker";
import "./datePicker.css";
import { parseISO, format } from "date-fns";
import Swal from "sweetalert2";
import axios from "axios";
import LoadingSpinner from "../LoadingSpinner";

const ScheduleStep = ({ onShareLinkChange, onNextStep }) => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startValue, setStartValue] = useState(new Date());
  const [endValue, setEndValue] = useState(new Date());
  const [reservationCounter, setReservationCounter] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleChange = (date) => {
    setSelectedDate(date[0]);
  };

  useEffect(() => {
    setStartValue(selectedDate);
    setEndValue(selectedDate);
  }, [selectedDate]);

  const storedTempEvent = JSON.parse(localStorage.getItem("tempEvent")) || {};
  const finalDate = new Date(storedTempEvent.selectedSchedule);
  finalDate.setDate(finalDate.getDate() + 1);

  useEffect(() => {
    const storedEvents =
      JSON.parse(localStorage.getItem("availableApiResponse")) || [];

    const container = document.querySelector(".Tx");
    const dayItems = container.querySelectorAll("._3n");

    storedEvents.availableTimes.forEach((time) => {
      const startDate = new Date(time.start);
      const endDate = new Date(time.end);

      dayItems.forEach((dayItem) => {
        const dateLabel = dayItem.querySelector("._1g");

        if (dateLabel) {
          const day = parseInt(dateLabel.textContent, 10) + 1;
          const month = startDate.getMonth();
          const year = startDate.getFullYear();

          const currentDate = new Date(year, month, day);

          if (currentDate >= startDate && currentDate <= endDate) {
            // Check if the pseudo-element is already added to avoid duplication
            if (!dayItem.classList.contains("has-available-times")) {
              // Add the class to the _3n element itself

              // Create and append a ::before pseudo-element
              const beforeElement = document.createElement("div");
              beforeElement.className = "has-available-times"; // Add your custom class here

              // Insert the pseudo-element as the first child of _3n
              dayItem.insertBefore(beforeElement, dayItem.firstChild);
            }
          }
        }
      });
    });
    const uniqueEvents = new Set();

    const createEvent = (eventData, editable = true) => ({
      ...eventData,
      editable,
    });

    storedEvents.availableTimes.forEach((time) => {
      const availableEvent = createEvent({
        title: "Available",
        start: time.start,
        end: time.end,
        backgroundColor: "rgba(74, 85, 104, 0.7)",
        color: "rgba(74, 85, 104, 0.7)",
      });

      const preEvent = time.preEvent
        ? createEvent(
            {
              title: time.preEvent.summary,
              start: time.preEvent.startTime,
              end: time.preEvent.endTime,
              backgroundColor: "rgba(0, 115, 204, 0.7)",
              color: "rgba(0, 115, 204, 0.7)",
            },
            false
          )
        : null;

      const nextEvent = time.nextEvent
        ? createEvent(
            {
              title: time.nextEvent.summary,
              start: time.nextEvent.startTime,
              end: time.nextEvent.endTime,
              backgroundColor: "rgba(0, 115, 204, 0.7)",
              color: "rgba(0, 115, 204, 0.7)",
            },
            false
          )
        : null;

      const allDayEvents = time.allDayEvents.map((event) =>
        createEvent(
          {
            title: event.summary,
            start: event.startTime,
            end: event.endTime,
            backgroundColor: "rgba(226, 52, 36, 0.7)",
            color: "rgba(226, 52, 36, 0.7)",
            allDay: true,
          },
          false
        )
      );

      [availableEvent, preEvent, nextEvent, ...allDayEvents].forEach(
        (event) => {
          if (event !== null) {
            uniqueEvents.add(JSON.stringify(event));
          }
        }
      );
    });

    // Load reservation events from localStorage
    const storedReservations =
      JSON.parse(localStorage.getItem("reservationList")) || [];

    storedReservations.forEach((reservation) => {
      const reservationEvent = createEvent({
        title: reservation.title,
        start: reservation.start,
        end: reservation.end,
        backgroundColor: reservation.backgroundColor,
        color: reservation.color,
      });

      uniqueEvents.add(JSON.stringify(reservationEvent));
    });

    const allEvents = Array.from(uniqueEvents).map((eventString) =>
      JSON.parse(eventString)
    );
    setEvents(allEvents);
  }, []);

  const handleEventClick = (info) => {
    const isReservationEvent = info.event.title.startsWith("Reservation");
    const isAvailableEvent = info.event.title.startsWith("Available");

    if (isReservationEvent) {
      // Prompt a confirmation dialog

      Swal.fire({
        title: "是否要刪除預約時段",
        showCancelButton: true,
        confirmButtonText: "Yes",
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          removeReservation(info.event);
          Swal.fire("Success!", "", "success");
        }
      });
    }
    if (isAvailableEvent) {
      const duplicateEvent = info.event;

      const reservationTitle = `Reservation ${reservationCounter}`;
      setReservationCounter((prevCounter) => prevCounter + 1);

      const reservationEvent = {
        title: reservationTitle,
        start: format(new Date(duplicateEvent.start), "yyyy-MM-dd HH:mm:ss"),
        end: format(new Date(duplicateEvent.end), "yyyy-MM-dd HH:mm:ss"),
        backgroundColor: "rgba(255, 199, 39, 1)",
        color: "rgba(255, 199, 39, 1)",
      };

      addToReservationList(reservationEvent);
    }
  };

  const removeReservation = (eventToRemove) => {
    // Remove the event from localStorage
    const storedEvents =
      JSON.parse(localStorage.getItem("reservationList")) || [];

    const updatedEvents = storedEvents.filter(
      (event) => !isSameEvent(event, eventToRemove)
    );

    localStorage.setItem("reservationList", JSON.stringify(updatedEvents));

    // Remove the event from the UI
    setEvents((prevEvents) =>
      prevEvents.filter((event) => !isSameEvent(event, eventToRemove))
    );
  };

  const addToReservationList = (eventToAdd) => {
    const storedEvents =
      JSON.parse(localStorage.getItem("reservationList")) || [];

    storedEvents.push(eventToAdd);
    localStorage.setItem("reservationList", JSON.stringify(storedEvents));

    setEvents((prevEvents) => [...prevEvents, eventToAdd]);
  };

  const handleEventResize = (info) => {
    const resizedEvent = info.event;

    if (resizedEvent.title === "Available") {
      const reservationTitle = `Reservation ${reservationCounter}`;
      setReservationCounter((prevCounter) => prevCounter + 1);

      const reservationEvent = {
        title: reservationTitle,
        start: format(new Date(resizedEvent.start), "yyyy-MM-dd HH:mm:ss"),
        end: format(new Date(resizedEvent.end), "yyyy-MM-dd HH:mm:ss"),
        backgroundColor: "#FFC727",
        color: "#FFC727",
      };

      addToReservationList(reservationEvent);
    } else if (resizedEvent.title.startsWith("Reservation")) {
      if (isDurationValid(resizedEvent)) {
        updateReservationTime(resizedEvent);
      } else {
        // Show an error message or handle the invalid duration case
        Swal.fire({
          icon: "error",
          title: "時間範圍錯誤",
          text: "時間區段不能小於活動時間",
        });
        // Revert the event to its original position
        info.revert();
      }
    }
  };

  const updateReservationTime = (resizedEvent) => {
    const storedEvents =
      JSON.parse(localStorage.getItem("reservationList")) || [];
    console.log(storedEvents);
    const updatedEvents = storedEvents.map((event) => {
      if (isSameEvent(event, resizedEvent)) {
        // Update the start and end times for the Reservation event
        return {
          ...event,
          start: format(new Date(resizedEvent.start), "yyyy-MM-dd HH:mm:ss"),
          end: format(new Date(resizedEvent.end), "yyyy-MM-dd HH:mm:ss"),
        };
      } else {
        return event;
      }
    });

    localStorage.setItem("reservationList", JSON.stringify(updatedEvents));
  };

  const isSameEvent = (event1, event2) => {
    return event1.title === event2.title;
  };

  const handleEventDrop = (info) => {
    const droppedEvent = info.event;

    if (droppedEvent.title === "Available") {
      // Handle dragging of Available events
      const reservationTitle = `Reservation ${reservationCounter}`;
      setReservationCounter((prevCounter) => prevCounter + 1);

      const reservationEvent = {
        title: reservationTitle,
        start: format(new Date(droppedEvent.start), "yyyy-MM-dd HH:mm:ss"),
        end: format(new Date(droppedEvent.end), "yyyy-MM-dd HH:mm:ss"),
        backgroundColor: "rgba(255, 199, 39, 1)",
        color: "rgba(255, 199, 39, 1)",
      };

      addToReservationList(reservationEvent);
    } else if (droppedEvent.title.startsWith("Reservation")) {
      // Handle dragging of reservation events
      if (isDurationValid(droppedEvent)) {
        updateReservationTime(droppedEvent);
      } else {
        // Show an error message or handle the invalid duration case
        Swal.fire({
          icon: "error",
          title: "時間範圍錯誤",
          text: "時間區段不能小於活動時間",
        });
        // Revert the event to its original position
        info.revert();
      }
    }
  };

  const isDurationValid = (event) => {
    const eventTimeDuration = JSON.parse(
      localStorage.getItem("eventTotalMinutes")
    );

    const start = new Date(event.start);
    const end = new Date(event.end);

    const eventDuration = (end - start) / (1000 * 60); // Duration in minutes

    return eventDuration >= eventTimeDuration;
  };

  const handleFinishClick = async () => {
    try {
      let reservationList = JSON.parse(localStorage.getItem("reservationList"));

      if (Array.isArray(reservationList)) {
        setLoading(true);

        reservationList = reservationList.map(({ start, end, ...rest }) => ({
          start,
          end,
          ...rest,
        }));

        console.log(reservationList);

        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const userIdFromLocalStorage = userInfo.id;

        const storedTempEvent = JSON.parse(localStorage.getItem("tempEvent"));
        console.log(storedTempEvent);

        const totalMinutes =
          parseISO(storedTempEvent.selectedDuration).getHours() * 60 +
          parseISO(storedTempEvent.selectedDuration).getMinutes();

        const scheduleData = {
          reservationList,
          name: storedTempEvent.eventName,
          duration: totalMinutes,
          finalDate: storedTempEvent.selectedSchedule,
          preference: storedTempEvent.selectedPreferences,
          userId: userIdFromLocalStorage,
        };

        const scheduleLinkResponse = await axios.post(
          "https://www.gootimetw.com/api/1.0.0/schedule/create",
          // "http://localhost:4000/api/1.0.0/schedule/create",
          scheduleData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const link = scheduleLinkResponse.data.link;
        console.log("Schedule link:", link);
        localStorage.removeItem("reservationList");
        onShareLinkChange(link);
        onNextStep();
      } else {
        Swal.fire({
          icon: "error",
          title: "尚未選擇可預約時段",
        });
      }
    } catch (error) {
      // Handle API call error
      console.error("API Call Error:", error);
    }
  };

  return (
    <div className="h-full flex flex-col pt-20 overflow-hidden">
      <Datepicker
        onChange={handleChange}
        value={selectedDate}
        startDate={new Date()}
        endDate={finalDate}
        startValue={startValue}
        endValue={endValue}
      />

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        // headerToolbar={{
        //   left: "",
        //   center: "title",
        //   right: "",
        // }}
        headerToolbar={false}
        initialView="timeGridDay"
        slotMinTime={"06:00:00"}
        // snapDuration="00:15:00"
        editable={true}
        selectable={true}
        droppable={true}
        validRange={{
          start: selectedDate,
          end: selectedDate,
        }}
        events={events.filter((event) => {
          const eventStartDate = new Date(event.start);
          const eventEndDate = new Date(event.end);
          const selectedStartDate = new Date(selectedDate);

          // Check if the selected date is within the range of the event
          return (
            (selectedStartDate >= eventStartDate &&
              selectedStartDate <= eventEndDate) ||
            (selectedStartDate.getDate() === eventStartDate.getDate() &&
              selectedStartDate.getMonth() === eventStartDate.getMonth() &&
              selectedStartDate.getFullYear() === eventStartDate.getFullYear())
          );
        })}
        height="auto"
        eventContent={(eventInfo) => {
          const isAllDay = eventInfo.event.allDay;

          // Calculate the duration in hours
          const start = new Date(eventInfo.event.start);
          const end = new Date(eventInfo.event.end);
          const durationInMilliseconds = end - start;
          const durationInHours = durationInMilliseconds / (1000 * 60 * 60);
          const roundedDuration = Math.round(durationInHours * 10) / 10;

          const eventStyle = `cursor-${
            eventInfo.event.editable ? "pointer" : "default"
          } ${
            isAllDay ? "h-30" : "h-auto"
          } m-1 whitespace-normal font-bold color:black overflow-hidden break-all overflow-wrap break-word word-wrap`;

          const titleStyle = "font-normal";

          return (
            <div className={eventStyle}>
              {isAllDay ? null : (
                <div>
                  {formatTime(eventInfo.event.start)} -{" "}
                  {formatTime(eventInfo.event.end)} ({roundedDuration})
                </div>
              )}
              <div className={titleStyle}>{eventInfo.event.title}</div>
            </div>
          );
        }}
        eventDrop={(info) => handleEventDrop(info)}
        eventResize={(info) => handleEventResize(info)}
        eventClick={(info) => handleEventClick(info)}
      />
      <button
        className=" bg-main-yellow bg-opacity-90 rounded-md h-10 left-4 right-4 bottom-24 hover:shadow-md hover:bg-opacity-100 mb-16 mt-8"
        onClick={handleFinishClick}
      >
        {loading && <LoadingSpinner />}
        Finish
      </button>
    </div>
  );
};

const formatTime = (time) => {
  const options = {
    hour: "numeric",
    minute: time.getMinutes() !== 0 ? "2-digit" : undefined,
  };

  const formattedTime = time.toLocaleTimeString("en-US", options);

  return formattedTime;
};

export default ScheduleStep;
