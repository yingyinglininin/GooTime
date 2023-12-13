const { DataTypes } = require("sequelize");
const sequelize = require("./database");
const Calendar = require("./Calendar");
const Schedule = require("./Schedule");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  picture: {
    type: DataTypes.STRING,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accessToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

User.hasMany(Calendar, { as: "calendars", foreignKey: "userId" });
Calendar.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Schedule, { as: "schedules", foreignKey: "userId" });
Schedule.belongsTo(User, { foreignKey: "userId", as: "users" });

User.sync();

module.exports = User;
