const { DataTypes } = require("sequelize");
const sequelize = require("./database");

const Calendar = sequelize.define("Calendar", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  summary: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  selected: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  accessRole: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  primary: {
    type: DataTypes.BOOLEAN,
  },
  timeZone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: "Users",
      key: "id",
    },
    allowNull: false,
  },
});

Calendar.sync();

module.exports = Calendar;
