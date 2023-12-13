const { Sequelize, DataTypes } = require("sequelize");

("use strict");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "accessToken", {
      type: DataTypes.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn("Users", "refreshToken", {
      type: DataTypes.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "accessToken");
    await queryInterface.removeColumn("Users", "refreshToken");
  },
};
