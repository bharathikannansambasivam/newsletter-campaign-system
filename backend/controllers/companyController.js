const bcrypt = require("bcrypt");
const Company = require("../models/Company");

exports.signup = async (req, res) => {
  const { companyName, email, password } = req.body;

  if (!companyName || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const existing = await Company.findOne({ $or: [{ email }, { companyName }] });
    if (existing) {
      return res.status(409).json({ message: "Company name or email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const company = await Company.create({ companyName, email, password: hashedPassword });

    res.status(201).json({ companyId: company._id, companyName: company.companyName });
  } catch (err) {
    res.status(500).json({ message: "Signup failed.", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const company = await Company.findOne({ email });
    if (!company) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, company.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.status(200).json({ companyId: company._id, companyName: company.companyName });
  } catch (err) {
    res.status(500).json({ message: "Login failed.", error: err.message });
  }
};
