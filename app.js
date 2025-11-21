const express = require("express");
const cors = require("cors");
require("dotenv").config();

const tableRoutes = require("./routes/tableRoute");
const sequelize = require("./utils/db-collection");

const app = express();

// middlewares json to pass the data and recieve in json formart
app.use(cors());
app.use(express.json());

// static route to load html aur ui files
app.use(express.static("public"));

// API Route
app.use("/tables", tableRoutes);

// default route — load HTML UI
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  try {
    await sequelize.authenticate();
    console.log("Database Connected");

    await sequelize.sync();
    console.log("Database Synced / Models Updated");
  } catch (err) {
    console.log("DB Connection Failed", err);
  }
});
