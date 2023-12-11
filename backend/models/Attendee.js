const { DataTypes } = require("sequelize");
const sequelize = require("./database");

const Attendee = sequelize.define("Attendee", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  selectedStartTime: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  selectedEndTime: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Attendee.sync();

module.exports = Attendee;
