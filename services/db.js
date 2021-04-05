require("dotenv").config();
const pg = require("pg");
const connectionString = process.env.DATABASE_URL;
const config = {
  // user: process.env.dbUser, //this is the db user credential
  // host: process.env.dbHost,
  // database: process.env.dbDatabase,
  // password: process.env.dbPassword,
  // port: process.env.dbPort,
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
};

const pool = new pg.Pool(config);

pool.on("connect", () => {
  console.log("connected to the Database");
});

pool.on("remove", () => {
  console.log("client removed");
});

//export pool and createTables to be accessible  from an where within the application
module.exports = {
  pool,
};
