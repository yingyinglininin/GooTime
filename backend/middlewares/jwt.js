const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/User");

// Configure the JWT strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_KEY,
};

passport.use(
  new JwtStrategy(jwtOptions, (jwtPayload, done) => {
    const email = jwtPayload.email;
    User.findOne({ where: { email: email } })
      .then((user) => {
        if (user) {
          const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            provider: user.provider,
            picture: user.picture,
            role: user.role,
          };
          return done(null, userData);
        } else {
          return done(null, false);
        }
      })
      .catch((err) => {
        return done(err, false);
      });
  })
);

module.exports = passport;
