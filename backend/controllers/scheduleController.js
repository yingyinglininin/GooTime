const {
  parse,
  parseISO,
  differenceInMinutes,
  format,
  isAfter,
  isSameDay,
  eachMinuteOfInterval,
  addDays,
  differenceInDays,
  isWithinInterval,
} = require("date-fns");
const axios = require("axios");

const { User, Calendar, Schedule, TimeSlot, Attendee } = require("../models");
const { google } = require("googleapis");
const { JWT } = require("google-auth-library");

const { v4: uuidv4 } = require("uuid");
const sequelize = require("../models/database");
const { Sequelize, Op } = require("sequelize");

const GOOGLE_CALENDAR_CLIENT_EMAIL = process.env.GOOGLE_CALENDAR_CLIENT_EMAIL;
const GOOGLE_CALENDAR_PRIVATE_KEY = process.env.GOOGLE_CALENDAR_PRIVATE_KEY;

const createAvailableTime = async (req, res, next) => {
  try {
    const { id, duration, finalDate, preference } = req.body;
    const calendarIds = await fetchCalendarIds(id);

    const finalDateTime = addDays(
      parse(finalDate, ["MM/dd/yyyy", "yyyy/MM/dd"], new Date()),
      1
    );

    console.log("finalDateTime", finalDateTime);

    const today = new Date();
    const daysLater = differenceInDays(finalDateTime, today);
    console.log("postData", daysLater);

    const postData = { id, daysLater, calendarIds };
    console.log("postData", postData);

    const googleCalendarEvents = await fetchGoogleCalendarEvents(postData);
    const eventList = googleCalendarEvents.data;
    const events = mergeOverlappingEvents(
      eventList.map((event) => ({
        summary: event.summary,
        startTime: parseISO(event.startTime),
        endTime: parseISO(event.endTime),
        isAllDayEvent: event.isAllDayEvent,
      }))
    );

    const { nonAllDayEvents, allDayEvents } = filterAllDayEvents(events);

    let currentDateTime = new Date();
    let gapStart = new Date();

    const availableTimes = [];

    while (isAfter(finalDateTime, currentDateTime)) {
      const nextEvent = findNextEvent(nonAllDayEvents, currentDateTime);

      if (nextEvent) {
        gapStart = currentDateTime;
        const gapEnd = nextEvent.startTime;

        const gapDuration = differenceInMinutes(gapEnd, gapStart);

        if (gapDuration >= duration) {
          availableTimes.push({ start: gapStart, end: gapEnd });
        }

        currentDateTime = nextEvent.endTime;
      }
    }

    const gapEnd = finalDateTime;
    const gapDuration = differenceInMinutes(gapEnd, gapStart);

    if (gapDuration >= duration) {
      availableTimes.push({ start: gapStart, end: gapEnd });
    }

    const timeRanges = {
      早上: { start: 6, end: 12 },
      下午: { start: 12, end: 18 },
      晚上: { start: 18, end: 24 },
    };

    const slicedTimes = sliceTimeRange(availableTimes, timeRanges);
    const filteredTimes = filterByPreference(
      slicedTimes,
      preference,
      timeRanges
    );
    const mergedTimes = mergeAdjacentTimes(filteredTimes);

    const filteredDurationTimes = mergedTimes.filter(({ start, end }) => {
      const timeSlotDuration = differenceInMinutes(
        new Date(end),
        new Date(start)
      );
      return timeSlotDuration >= duration;
    });

    const enrichedAvailableTimes = await Promise.all(
      filteredDurationTimes.map(async (time) => {
        const preEvent = await findNearestEvent(
          events,
          time.start,
          time.end,
          "previous"
        );
        const nextEvent = await findNearestEvent(
          events,
          time.start,
          time.end,
          "next"
        );

        const startTime = new Date(time.start);
        const endTime = new Date(time.end);

        const matchingAllDayEvents = getMatchingAllDayEvents(
          allDayEvents,
          startTime,
          endTime
        );

        return {
          start: format(startTime, "yyyy-MM-dd HH:mm:ss"),
          end: format(endTime, "yyyy-MM-dd HH:mm:ss"),
          preEvent,
          nextEvent,
          allDayEvents: matchingAllDayEvents,
        };
      })
    );

    res.json({
      availableTimes: enrichedAvailableTimes,
    });
  } catch (error) {
    console.log(error.message);
    next(new Error("[Error] compute available time"));
  }
};

// `http://${process.env.DOMAIN_NAME}/api/${process.env.API_VERSION}/user/calendar?userId=${userId}`
const fetchCalendarIds = async (userId) => {
  const calendarIdsResponse = await axios.get(
    `https://${process.env.DOMAIN_NAME}/api/${process.env.API_VERSION}/user/calendar?userId=${userId}`
  );
  return calendarIdsResponse.data.map((entry) => entry.id);
};

const fetchGoogleCalendarEvents = async (postData) => {
  return axios.post(
    `https://${process.env.DOMAIN_NAME}/api/auth/google/calendar/events`,
    // `http://${process.env.DOMAIN_NAME}/api/auth/google/calendar/events`,
    postData
  );
};

const mergeOverlappingEvents = (events) => {
  return events
    .sort((a, b) => a.startTime - b.startTime)
    .reduce((mergedEvents, currentEvent) => {
      const lastMergedEvent = mergedEvents[mergedEvents.length - 1];

      if (
        lastMergedEvent &&
        lastMergedEvent.endTime >= currentEvent.startTime &&
        !currentEvent.isAllDayEvent &&
        !lastMergedEvent.isAllDayEvent
      ) {
        lastMergedEvent.endTime = new Date(
          Math.max(lastMergedEvent.endTime, currentEvent.endTime)
        );
      } else {
        mergedEvents.push(currentEvent);
      }

      return mergedEvents;
    }, []);
};

const filterAllDayEvents = (events) => {
  return {
    nonAllDayEvents: events.filter((event) => !event.isAllDayEvent),
    allDayEvents: events.filter((event) => event.isAllDayEvent),
  };
};

const getMatchingAllDayEvents = (allDayEvents, startTime, endTime) => {
  return allDayEvents
    .filter((event) => {
      return (
        isWithinInterval(startTime, {
          start: new Date(event.startTime),
          end: new Date(event.endTime),
        }) &&
        isWithinInterval(endTime, {
          start: new Date(event.startTime),
          end: new Date(event.endTime),
        })
      );
    })
    .map((event) => ({
      summary: event.summary,
      startTime: format(new Date(event.startTime), "yyyy-MM-dd 00:00:00"),
      endTime: format(new Date(event.endTime), "yyyy-MM-dd 00:00:00"),
    }));
};

const findNextEvent = (events, currentDateTime) => {
  const nextEvent = events.find((event) =>
    isAfter(event.startTime, currentDateTime)
  );
  return nextEvent ? nextEvent : { startTime: new Date(0) };
};

const sliceTimeRange = (availableTimes, timeRanges) => {
  const slicedTimes = [];

  for (const { start, end } of availableTimes) {
    const slots = [];

    for (const key in timeRanges) {
      const { start: rangeStart, end: rangeEnd } = timeRanges[key];
      const dayStart = new Date(start).setHours(rangeStart, 0, 0, 0);
      const dayEnd = new Date(end).setHours(rangeEnd, 0, 0, 0);

      const minutes = eachMinuteOfInterval({
        start: dayStart,
        end: dayEnd,
      });

      minutes.forEach((minute) => {
        const slotStart = minute;
        const slotEnd = new Date(minute).setMinutes(
          new Date(minute).getMinutes() + 1
        );

        if (slotStart >= start && slotEnd <= end) {
          slots.push({ start: slotStart, end: slotEnd });
        }
      });
    }

    slicedTimes.push(...slots);
  }

  return slicedTimes;
};

const filterByPreference = (times, preference) => {
  const userPreferences = preference.map((p) => p.trim());
  return times.filter(({ start, end }) => {
    const hour = new Date(start).getHours();
    const isWeekday =
      new Date(start).getDay() >= 1 && new Date(start).getDay() <= 5;

    // Part1 > TimeRange (Morning/Afternoon/Night)
    const phase1Result = userPreferences.some((pref) => {
      if (pref === "早上") {
        return 6 <= hour && hour < 12;
      } else if (pref === "下午") {
        return 12 <= hour && hour < 18;
      } else if (pref === "晚上") {
        return 18 <= hour && hour < 24;
      }
    });

    if (!phase1Result) {
      return false;
    }

    // Part2 > WeekDay & Weekend

    return userPreferences.some((pref) => {
      if (pref === "平日") {
        return isWeekday;
      } else if (pref === "假日") {
        return !isWeekday;
      } else {
        return false;
      }
    });
  });
};

const mergeAdjacentTimes = (times) => {
  const mergedTimes = [];
  let currentStart = null;
  let currentEnd = null;

  for (const { start, end } of times) {
    if (currentEnd && isAfter(start, currentEnd)) {
      if (currentStart && currentEnd && isAfter(currentEnd, currentStart)) {
        mergedTimes.push({ start: currentStart, end: currentEnd });
      }
      currentStart = start;
      currentEnd = end;
    } else {
      if (!currentStart || isAfter(end, currentEnd)) {
        currentEnd = end;
      }
      if (!currentStart) {
        currentStart = start;
      }
    }
  }

  if (currentStart && currentEnd && isAfter(currentEnd, currentStart)) {
    mergedTimes.push({ start: currentStart, end: currentEnd });
  }

  return mergedTimes;
};

const findNearestEvent = async (events, startTime, endTime, direction) => {
  let nearestEvent = null;

  for (const event of events) {
    if (
      isSameDay(event.startTime, startTime) &&
      isSameDay(event.endTime, startTime)
    ) {
      if (
        (direction === "previous" && event.endTime <= startTime) ||
        (direction === "next" && event.startTime >= endTime)
      ) {
        if (
          !nearestEvent ||
          (direction === "previous" && event.endTime > nearestEvent.endTime) ||
          (direction === "next" && event.startTime < nearestEvent.startTime)
        ) {
          nearestEvent = event;
        }
      }
    }
  }

  if (nearestEvent) {
    return {
      summary: nearestEvent.summary,
      startTime: format(nearestEvent.startTime, "yyyy-MM-dd HH:mm:ss"),
      endTime: format(nearestEvent.endTime, "yyyy-MM-dd HH:mm:ss"),
    };
  } else {
    return null;
  }
};

const createSchedule = async (req, res, next) => {
  try {
    const {
      reservationList,
      name,
      duration,
      finalDate,
      preference,
      type,
      userId,
    } = req.body;

    const randomLink = uuidv4();

    await sequelize.transaction(async (t) => {
      const newSchedule = await Schedule.create(
        {
          name,
          duration,
          finalDate,
          preference: preference.join(","),
          type: type || "person",
          link: randomLink,
          status: "pending",
          userId: userId,
        },
        { transaction: t }
      );

      // Create TimeSlots associated with the new schedule
      await Promise.all(
        reservationList.map(async (item) => {
          await TimeSlot.create(
            {
              start: item.start,
              end: item.end,
              status: "unselected",
              priority: item.priority || "",
              note: item.notes || "",
              scheduleId: newSchedule.id,
            },
            { transaction: t }
          );
        })
      );
    });
    //${process.env.DOMAIN_NAME}
    res.json({
      link: `https://${process.env.DOMAIN_NAME}/share/${randomLink}`,
    });
  } catch (error) {
    console.error("Error creating schedule:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAvailableTimeByLink = async (req, res, next) => {
  try {
    const { link } = req.params;

    // Fetch the schedule, associated time slots, and user information by link
    const schedule = await Schedule.findOne({
      where: { link },
      include: [
        {
          model: User,
          as: "users",
          attributes: ["name", "picture"],
        },
        {
          model: TimeSlot,
          as: "timeSlots",
        },
      ],
    });

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    // Process the data as needed
    const processedData = {
      id: schedule.id,
      name: schedule.name,
      duration: schedule.duration,
      user: {
        name: schedule.users.name,
        picture: schedule.users.picture,
      },
      timeSlots: schedule.timeSlots
        .reduce((acc, timeSlot) => {
          // Assuming you have the generateTimeWindows function defined
          const generatedTimeWindows = generateTimeWindows(
            timeSlot.start,
            timeSlot.end,
            schedule.duration
          );
          console.log(timeSlot);
          console.log(generatedTimeWindows);

          // Concatenate the generatedTimeWindows to the accumulator array
          return acc.concat(generatedTimeWindows);
        }, [])
        .sort((a, b) => new Date(a.start) - new Date(b.start)),
    };

    res.json(processedData);
  } catch (error) {
    console.error("Error getting available time by link:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

function generateTimeWindows(
  availableStartTime,
  availableEndTime,
  duration,
  interval = 30
) {
  const timeWindows = [];

  // Convert available start and end times to minutes for easier manipulation
  const startTimeInMinutes = convertToMinutes(availableStartTime);
  const endTimeInMinutes = convertToMinutes(availableEndTime);

  // Iterate through the available time range with the specified interval
  for (
    let start = startTimeInMinutes;
    start + duration <= endTimeInMinutes;
    start += interval
  ) {
    const end = start + duration;

    // Convert back to HH:mm format
    const startTimeFormatted = convertToHHMM(start);
    const endTimeFormatted = convertToHHMM(end);

    // Add the time window to the result
    const startTimeWithDate = addOriginalDate(
      availableStartTime,
      startTimeFormatted
    );
    const endTimeWithDate = addOriginalDate(
      availableStartTime,
      endTimeFormatted
    );

    timeWindows.push({
      start: startTimeWithDate,
      end: endTimeWithDate,
    });
  }

  return timeWindows;
}
// Helper function to convert time format to minutes
function convertToMinutes(time) {
  const [date, clock] = time.split(" ");
  const [hours, minutes] = clock.split(":").map(Number);

  const adjustedHours = hours === 0 ? 24 : hours;

  return adjustedHours * 60 + minutes;
}

// Helper function to convert minutes to HH:mm time format
function convertToHHMM(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

// Helper function to add the original date to the time
function addOriginalDate(originalDateTime, time) {
  // Assume originalDateTime is in "yyyy-MM-dd HH:mm:ss" format
  const [date, clock] = originalDateTime.split(" ");
  const [year, month, day] = date.split("-");
  return `${year}-${month}-${day} ${time}`;
}

const submitSchedule = async (req, res, next) => {
  try {
    const t = await sequelize.transaction();

    const { link, startTime, endTime, attendeeName, attendeeEmail } = req.body;

    const [updatedRows, updatedSchedules] = await Promise.all([
      Schedule.update(
        {
          status: "done",
          finalStartTime: startTime,
          finalEndTime: endTime,
        },
        {
          where: { link, status: { [Op.not]: "done" } },
          transaction: t,
        }
      ),
      Schedule.findAll({
        where: { link },
        transaction: t,
      }),
    ]);

    if (updatedRows[0] === 0) {
      throw new Error("Schedule not found or already submitted");
    }

    const newAttendee = await Attendee.create(
      {
        name: attendeeName,
        email: attendeeEmail,
        selectedStartTime: startTime,
        selectedEndTime: endTime,
        scheduleId: updatedSchedules[0].id,
      },
      {
        transaction: t,
      }
    );
    const schedule = await Schedule.findOne({
      where: { link },
      include: [
        {
          model: User,
          as: "users",
          include: [
            {
              model: Calendar,
              as: "calendars",
              where: { primary: true },
            },
          ],
        },
      ],
    });

    if (!schedule) {
      console.error("Schedule not found");
      return res.status(404).json({ error: "Schedule not found" });
    }

    const eventName = schedule.name;
    const primaryCalendarId = schedule.users.calendars[0].id;

    const event = {
      summary: eventName,
      start: {
        dateTime: new Date(startTime),
        timeZone: "Asia/Taipei",
      },
      end: {
        dateTime: new Date(endTime),
        timeZone: "Asia/Taipei",
      },
    };

    const client = new JWT({
      email: GOOGLE_CALENDAR_CLIENT_EMAIL,
      key: GOOGLE_CALENDAR_PRIVATE_KEY,
      scopes: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events",
      ],
    });

    const calendar = google.calendar({ version: "v3" });

    try {
      const insertResponse = await calendar.events.insert({
        calendarId: primaryCalendarId,
        auth: client,
        requestBody: event,
      });

      console.log(insertResponse.data.htmlLink);
      res.status(200).json(insertResponse.data.htmlLink);
    } catch (error) {
      console.error("Error inserting event into calendar:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getMySchedule = async (req, res, next) => {
  try {
    const { id } = req.user;

    const userData = await User.findByPk(id, {
      include: [
        {
          model: Schedule,
          as: "schedules",
          attributes: [
            "id",
            "name",
            "duration",
            "finalDate",
            "link",
            "status",
            "finalStartTime",
            "finalEndTime",
          ],
        },
      ],
    });

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(userData);
  } catch (error) {
    console.error("Error getting available time by link:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createAvailableTime,
  createSchedule,
  getAvailableTimeByLink,
  submitSchedule,
  getMySchedule,
};
