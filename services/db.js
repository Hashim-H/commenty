require("dotenv").config();
const pg = require("pg");
const connectionString = process.env.DATABASE_URL;
const config = {
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
