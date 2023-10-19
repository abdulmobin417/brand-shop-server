const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hixyzlt.mongodb.net/?retryWrites=true&w=majority`;



app.get("/", (req, res) => {
  res.send("Brand Shop server is running");
});

app.listen(port, () => {
  console.log(`Brand Shop Server is running on port: ${port}`);
});
