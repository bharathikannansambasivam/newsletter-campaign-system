const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Company = require("../models/Company");

exports.signup = async (req, res) => {
  const { companyName, email, password } = req.body;

  if (!companyName || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const existing = await Company.findOne({
      $or: [{ email }, { companyName }],
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Company name or email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const company = await Company.create({
      companyName,
      email,
      password: hashedPassword,
    });

    res
      .status(201)
      .json({ companyId: company._id, companyName: company.companyName });
  } catch (err) {
    res.status(500).json({ message: "Signup failed.", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    const company = await Company.findOne({ email });
    console.log("Entered:", password);
    console.log("Stored:", company.password);
    if (!company) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, company.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const accessToken = jwt.sign(
      { companyId: company._id, companyName: company.companyName },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { companyId: company._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    const cookieOptions = { httpOnly: true, secure: false, sameSite: "strict" };
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ companyName: company.companyName });
  } catch (err) {
    res.status(500).json({ message: "Login failed.", error: err.message });
  }
};

exports.refresh = (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "No refresh token." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const accessToken = jwt.sign(
      { companyId: decoded.companyId },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Token refreshed." });
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token." });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out." });
};
