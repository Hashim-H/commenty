require("dotenv").config();
const pg = require("pg");
const connectionString =
  "postgres://eunuycpbijtusc:f7b7aa17a73ae320ae2a477a75fc6bb1283c3a6acee5b1beb1fa54615b715178@ec2-54-90-13-87.compute-1.amazonaws.com:5432/d9jrueq00rrr4g";
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
