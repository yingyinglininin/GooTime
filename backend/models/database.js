const { Sequelize } = require("sequelize");
const mysql = require("mysql2");
// const path = require("path");
// const configPath = path.resolve(__dirname, "../config/config");
// const config = require(configPath);

// const env = process.env.NODE_ENV || "development";
// const dbConfig = config[env];

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  { host: process.env.DB_HOST, dialect: process.env.DB_CONNECTION }
);

async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection to database has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = sequelize;
