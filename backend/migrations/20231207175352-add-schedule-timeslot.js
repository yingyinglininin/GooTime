const { Sequelize, DataTypes } = require("sequelize");
("use strict");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Schedules", {
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
    }),
      await queryInterface.createTable(
        "TimeSlots",
        {
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
          scheduleId: {
            type: Sequelize.INTEGER,
            references: {
              model: "Schedules",
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
        },
        await queryInterface.createTable("Attendees", {
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
          scheduleId: {
            type: Sequelize.INTEGER,
            references: {
              model: "Schedules",
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
        })
      );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Attendees");
    await queryInterface.dropTable("TimeSlots");
    await queryInterface.dropTable("Schedules");
  },
};
