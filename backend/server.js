const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req,res)=> res.send("API running"));

app.listen(5000, ()=> console.log("Server running"));
