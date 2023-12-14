const { DataTypes } = require("sequelize");
const sequelize = require("./database");
const TimeSlot = require("./TimeSlot");
const Attendee = require("./Attendee");

const Schedule = sequelize.define("Schedule", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  finalDate: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  preference: {
    type: DataTypes.STRING,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  link: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  finalStartTime: {
    type: DataTypes.STRING,
  },
  finalEndTime: {
    type: DataTypes.STRING,
  },
});

Schedule.hasMany(TimeSlot, { as: "timeSlots", foreignKey: "scheduleId" });
TimeSlot.belongsTo(Schedule, { foreignKey: "scheduleId" });

Schedule.hasMany(Attendee, { as: "attendees", foreignKey: "scheduleId" });
Attendee.belongsTo(Schedule, { foreignKey: "scheduleId", as: "attendees" });

Schedule.sync();

module.exports = Schedule;
