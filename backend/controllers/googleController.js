const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const { format } = require("date-fns");

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `https://${process.env.DOMAIN_NAME}/api/auth/google/callback`
);

const calendar = google.calendar({
  version: "v3",
  auth: oauth2Client,
});

let refreshToken = null;

exports.login = (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/calendar",
    ],
  });
  res.redirect(authUrl);
};

exports.oauthCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    refreshToken = tokens.refresh_token;
    oauth2Client.setCredentials(tokens);

    const people = google.people({ version: "v1", auth: oauth2Client });
    const { data } = await people.people.get({
      resourceName: "people/me",
      personFields: "emailAddresses,names,photos",
    });

    const googleUserData = {
      name: data.names[0].displayName || "",
      email: data.emailAddresses[0].value || "",
      picture: data.photos[0].url || "",
    };

    req.googleUserData = googleUserData;

    await createUser(req, res);
    await getCalendarLists(req, res);
    const { token } = req;

    res.redirect(`https://www.gootimetw.com/home?token=${token}`);
  } catch (error) {
    console.error("[Error] google OAuth callback:", error);
  }
};

const createUser = async (req, res) => {
  try {
    const googleUserData = req.googleUserData;
    const response = await axios.post(
      `https://${process.env.DOMAIN_NAME}/api/${process.env.API_VERSION}/user/signin`,
      googleUserData
    );

    const { token, user: userResponse } = response.data;

    const { id } = userResponse.id;
    req.userId = id;
    req.token = token;
  } catch (error) {
    console.error("[Error] post createUser api", error);
  }
};

const getCalendarLists = async (req, res, next) => {
  try {
    const { userId } = req;
    const { data: calendarListData } = await calendar.calendarList.list();
    const allCalendarData = calendarListData.items.map((item) => {
      return {
        id: item.id,
        summary: item.summary,
        selected: item.selected || false,
        accessRole: item.accessRole,
        primary: item.primary || false,
        timeZone: item.timeZone,
        userId: userId,
      };
    });

    req.allCalendarData = allCalendarData;
    await createCalendar(req, res);
  } catch (error) {
    console.error("[Error] fetching calendar list", error);
  }
};

const createCalendar = async (req, res) => {
  try {
    const allCalendarData = req.allCalendarData;

    const response = await axios.post(
      `https://${process.env.DOMAIN_NAME}/api/${process.env.API_VERSION}/user/calendar`,
      allCalendarData
    );
    // const calendarIdsResponse = await axios.get(
    //   `http://${process.env.DOMAIN_NAME}/api/${process.env.API_VERSION}/user/calendar?userId=85`
    // );

    // // Extract id values from the data
    // const calendarIds = calendarIdsResponse.data.map((entry) =>
    //   encodeURIComponent(entry.id)
    // );

    // console.log(JSON.stringify(calendarIds));

    // return res.redirect(
    //   `http://${
    //     process.env.DOMAIN_NAME
    //   }/api/auth/google/calendar/events?calendarIds=${JSON.stringify(
    //     calendarIds
    //   )}`
    // );

    // return res.status(200).json("Success");
  } catch (error) {
    console.error("[Error] post createUserCalendarList api", error);
  }
};

exports.getCalendarEvents = async (req, res, next) => {
  try {
    await oauth2Client.getAccessToken();

    const { daysLater = 7, calendarIds } = req.body;
    console.log("Here", calendarIds);

    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + parseInt(daysLater));

    const calendarIdArray = calendarIds || [];

    const allEvents = [];
    for (const calendarId of calendarIdArray) {
      oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      const { data } = await calendar.events.list({
        calendarId,
        timeMin: today.toISOString(),
        timeMax: maxDate.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
      });

      const events = data.items || [];

      const extractedEvents = events.map((event) => {
        const summary = event.summary;

        // Function to add time component if it's not present (for All Day Events)
        const addTimeComponent = (dateString) => {
          return dateString.includes("T")
            ? dateString
            : dateString + "T00:00:00";
        };

        // Check if the event is an All Day Event
        const isAllDayEvent = !!event.start.date && !!event.end.date;

        // Use appropriate formatting based on whether it's an All Day Event
        const startTime = format(
          new Date(
            addTimeComponent(
              isAllDayEvent ? event.start.date : event.start.dateTime
            )
          ),
          "yyyy-MM-dd HH:mm:ss"
        );

        const endTime = format(
          new Date(
            addTimeComponent(
              isAllDayEvent ? event.end.date : event.end.dateTime
            )
          ),
          "yyyy-MM-dd HH:mm:ss"
        );

        return {
          calendarId,
          summary,
          startTime,
          endTime,
          isAllDayEvent,
        };
      });

      allEvents.push(...extractedEvents);
    }
    console.log(allEvents);
    res.json(allEvents);
  } catch (error) {
    console.log(error.message);
    next(new Error("[Error] fetching calendar events"));
  }
};
