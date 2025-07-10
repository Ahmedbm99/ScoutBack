console.log('Backend server is running...');

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const config = require("./config/config");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const { sequelize } = require("./models");

require("dotenv").config();

const server = express();

// 1. CORS CONFIG
server.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*'); // Replace with your client's origin
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
  });
server.options('*', cors());

// 3. AUTRES MIDDLEWARES
server.use(morgan("combined"));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(bodyParser.json());

server.use("/public", express.static("public"));
server.use("/uploads", express.static(path.join(__dirname, "uploads")));
require('./passport')
// 4. ROUTES
const routes = require("./routes");
server.use("/api", routes);

// 5. SERVER START
sequelize.sync({ force: false }).then(() => {
  server.listen(config.port, () =>
    console.log(`Express server running on port ${config.port}`)
  );
});
