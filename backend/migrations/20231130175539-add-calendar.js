const { Sequelize, DataTypes } = require("sequelize");
("use strict");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Calendars", {
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
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),

        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,
        onUpdate: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Calendars");
  },
};
