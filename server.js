require("dotenv").config();
const path = require("path");
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const { initializeDatabase } = require("./database/database");

const app = express();
const PORT = process.env.PORT || 3000;

initializeDatabase();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(authRoutes);

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Smart Cart server running at http://localhost:${PORT}`);
});
