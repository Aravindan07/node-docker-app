const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

exports.signUp = async (req, res, next) => {
	const { username, password } = req.body;

	try {
		const hashPassword = await bcrypt.hash(password, 12);
		const newUser = await User.create({ username, password: hashPassword });
		req.session.user = newUser;
		res.status(201).json({ status: "success", data: { user: newUser } });
	} catch (error) {
		console.error(error);
		res.status(400).json({ status: "failed" });
	}
};

exports.login = async (req, res, next) => {
	const { username, password } = req.body;

	try {
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(404).json({ status: "fail", message: "user not found" });
		}

		const isCorrect = await bcrypt.compare(password, user.password);
		if (isCorrect) {
			req.session.user = user;
			res.status(200).json({ status: "success" });
		} else {
			res.status(400).json({ status: "fail", message: "Incorrect username or password" });
		}
	} catch (error) {
		console.error(error);
		res.status(400).json({ status: "failed" });
	}
};
