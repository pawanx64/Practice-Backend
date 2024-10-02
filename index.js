require('dotenv').config();
const express = require('express');
const connectDB = require('./connectDB');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
	cors({
	  origin: ["https://practice-frontend-ochre.vercel.app/"],
	  methods: ["GET", "POST", "PUT", "DELETE"],
	  credentials: true,
	  allowedHeaders: ["Content-Type", "Authorization"],
	})
);

app.options('*', cors());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log("Listening on port " + PORT);
	connectDB();
});

app.get('/', (req, res) => {
    res.send('this is root');
});

// account routes
const account = require('./routes/account');
app.use("/account", account);