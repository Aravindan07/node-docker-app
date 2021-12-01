const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
const redis = require("redis");
let RedisStore = require("connect-redis")(session);

const {
	MONGO_USER,
	MONGO_PASSWORD,
	MONGO_IP,
	MONGO_PORT,
	REDIS_URL,
	REDIS_PORT,
	SESSION_SECRET,
} = require("./config/config");

let redisClient = redis.createClient({
	port: REDIS_PORT,
	host: REDIS_URL,
});

const postRoutes = require("./routes/postRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}?authSource=admin`;

const connectWithRetry = () => {
	mongoose
		.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(() => console.log("Database connected successfully!!!"))
		.catch((e) => {
			console.error(e);
			setTimeout(connectWithRetry, 5000);
		});
};

connectWithRetry();

app.enable("trust proxy");
app.use(cors());

app.use(
	session({
		store: new RedisStore({ client: redisClient }),
		secret: SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
		cookie: {
			secure: false,
			httpOnly: true,
			maxAge: 60000,
		},
	})
);

app.use(express.json());

app.get("/api/v1", (req, res) => {
	console.log("Yeah it ran");
	res.send("<h2>Hello Bros 🐕🐕‍🦺</h2>");
});

app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/users", authRoutes);

const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`Server started on port ${port}`));
