const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const { format } = require("date-fns");
const { User } = require("../models");

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `https://${process.env.DOMAIN_NAME}/api/auth/google/callback`
  // `http://${process.env.DOMAIN_NAME}/api/auth/google/callback`
);

const calendar = google.calendar({
  version: "v3",
  auth: oauth2Client,
});

exports.login = (req, res) => {
  req.session.loginSource = req.query.source;
  req.session.link = req.query.link;
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
    const { access_token, refresh_token, expiry_date } = tokens;
    console.log("token", tokens);
    console.log("access_token", access_token);
    console.log("refresh_token", refresh_token);

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
      accessToken: access_token,
      ...(refresh_token ? { refreshToken: refresh_token } : {}),
      expiryDate: expiry_date,
    };

    req.googleUserData = googleUserData;

    await createUser(req, res);
    await getCalendarLists(req, res);

    const loginSource = req.session.loginSource;
    const link = req.session.link;

    const { token } = req;

    if (loginSource === "sharepage") {
      res.redirect(
        `https://${process.env.DOMAIN_NAME}/share/${link}?token=${token}`
      );
      // res.redirect(`http://localhost:3000/share/${link}?token=${token}`);
    }

    res.redirect(`https://${process.env.DOMAIN_NAME}/home?token=${token}`);
    // res.redirect(`http://localhost:3000/home?token=${token}`);
  } catch (error) {
    console.error("[Error] google OAuth callback:", error);
  }
};

const createUser = async (req, res) => {
  try {
    const googleUserData = req.googleUserData;
    const response = await axios.post(
      `https://${process.env.DOMAIN_NAME}/api/${process.env.API_VERSION}/user/signin`,
      // `http://${process.env.DOMAIN_NAME}/api/${process.env.API_VERSION}/user/signin`,
      googleUserData
    );

    const { token, user } = response.data;
    const { id } = user;

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
      // `http://${process.env.DOMAIN_NAME}/api/${process.env.API_VERSION}/user/calendar`,

      allCalendarData
    );
  } catch (error) {
    console.error("[Error] post createUserCalendarList api", error);
  }
};

exports.getCalendarEvents = async (req, res, next) => {
  try {
    const { id, daysLater = 7, calendarIds } = req.body;
    console.log("Here", req.body);

    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + parseInt(daysLater));

    const calendarIdArray = calendarIds || [];

    const tokens = await getTokens(id);
    const { accessToken, refreshToken } = tokens;

    // Set the credentials (access token and refresh token) for the client
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const allEvents = [];
    for (const calendarId of calendarIdArray) {
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
    console.error("Error fetching calendar events:", error.message);
    next(new Error("[Error] fetching calendar events"));
  }
};

const getTokens = async (userId) => {
  try {
    const user = await User.findOne({
      where: {
        id: userId,
      },
    });

    return user
      ? {
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          expiryDate: user.expiryDate,
        }
      : null;
  } catch (error) {
    console.error("[Error] getAccessToken:", error);
    throw error;
  }
};
