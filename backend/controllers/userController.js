const User = require("../models/User");
const Calendar = require("../models/Calendar");
const jwt = require("jsonwebtoken");

exports.userSignIn = async (req, res, next) => {
  try {
    const userData = req.body;
    let {
      name,
      email,
      picture,
      provider,
      role,
      accessToken,
      refreshToken,
      expiryDate,
    } = userData;

    const [user] = await User.upsert(
      {
        name,
        email,
        provider: provider || "google",
        picture,
        role: role || "user",
        accessToken,
        ...(refreshToken && { refreshToken }),
        expiryDate,
      },
      { returning: true }
    );

    const userResponse = {
      id: user.dataValues.id,
      name: user.dataValues.name,
      email: user.dataValues.email,
      provider: user.dataValues.provider,
      picture: user.dataValues.picture,
      role: user.dataValues.role,
    };

    const jwtToken = jwt.sign(userResponse, process.env.JWT_SECRET_KEY, {
      expiresIn: 3600,
    });

    return res.status(200).json({ token: jwtToken, user: userResponse });
  } catch (error) {
    next(new Error("[Error] create user"));
  }
};

exports.createUserCalendarList = async (req, res, next) => {
  try {
    const calendarList = req.body;

    for (const calendarData of calendarList) {
      const { id, summary, selected, accessRole, primary, timeZone, userId } =
        calendarData;

      const [calendar] = await Calendar.upsert(
        {
          id,
          summary,
          selected,
          accessRole,
          primary,
          timeZone,
          userId,
        },
        { returning: true }
      );
    }

    return res.status(200).json("Success");
  } catch (error) {
    next(new Error("[Error] create calendar list"));
  }
};

exports.getUserCalendarList = async (req, res, next) => {
  try {
    const { userId } = req.query;

    const userCalendars = await Calendar.findAll({
      where: { userId: userId },
    });

    const formattedCalendars = userCalendars.map((calendar) => ({
      id: calendar.id,
      summary: calendar.summary,
      selected: calendar.selected,
      accessRole: calendar.accessRole,
      primary: calendar.primary,
      timeZone: calendar.timeZone,
      userId: calendar.userId,
    }));

    return res.status(200).json(formattedCalendars);
  } catch (error) {
    next(new Error("[Error] get calendar list"));
  }
};

exports.getUserName = async (req, res, next) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    next(new Error("[Error] get calendar list"));
  }
};
