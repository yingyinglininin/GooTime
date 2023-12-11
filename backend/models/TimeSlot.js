const { DataTypes } = require("sequelize");
const sequelize = require("./database");

const TimeSlot = sequelize.define("TimeSlot", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  start: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  end: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  priority: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  note: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

TimeSlot.sync();

module.exports = TimeSlot;
