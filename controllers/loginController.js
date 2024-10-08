const express = require("express"),
  router = express.Router();
const service = require("../services/loginServices");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // Gmail SMTP port (465 or 587)
  secure: true, // true for 465, false for other ports
  auth: {
    user: "icafeconnectapp@gmail.com", // Your email address
    pass: "fynu gzny phsg lptr", // Your app password for Gmail
  },
});
transporter.on("log", console.log);

// Function to generate OTP
const generateOtp = () => {
  // Generate a 6-digit random OTP
  return Math.floor(100000 + Math.random() * 900000);
};

const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
let userOtp = {};

router.post("/login", async (req, res) => {
  const { username: userBody, password: passwordBody } = req.body;

  const userValidation = await service.userValidity(userBody);
  if (userValidation.length == 0) {
    return res.status(405).json("Account is not Registered!");
  }

  const user = await service.loginVerification(userBody, passwordBody);
  if (!user) {
    return res.status(404).json("Username/Email Or Password is Wrong!");
  }

  res.json(user);
});

router.post("/register", async (req, res) => {
  const {
    username: usernameBody,
    password: passwordBody,
    email: emailBody,
    fullname: fullnameBody,
    phonenumber: phonenumberBody,
  } = req.body;

  const userValidation = await service.userValidity(usernameBody);
  if (userValidation.length != 0) {
    return res.status(404).send("Username is Taken!");
  }
  const emailValidity = await service.emailValidity(emailBody);
  if (emailValidity.length != 0) {
    return res.status(404).send("Email is Taken!");
  }
  const affectedRows = await service.addUser(
    usernameBody,
    passwordBody,
    emailBody,
    fullnameBody,
    phonenumberBody
  );
  if (affectedRows != 0) {
    res.status(201).send("Account Created Successfully!");
  } else {
    res.status(404).send("Unsuccessfull Account Creation");
  }
});

router.post("/request-otp", (req, res) => {
  const { email } = req.body;
  const otp = generateOtp();

  userOtp[email] = otp;

  // Send OTP email
  const mailOptions = {
    from: {
      name: "ICafe Connect",
      address: process.env.EMAIL_USER,
    },
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send("Error sending email");
    }
    res.status(200).send("OTP sent");
  });

  setTimeout(() => {
    delete userOtp[email];
  }, 300000); // 300,000 ms = 5 minutes
});

router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (userOtp[email] === otp) {
    delete userOtp[email]; // OTP is valid, delete it to prevent reuse
    res.status(200).send("OTP verified");
  } else {
    res.status(400).send("Invalid OTP");
  }
});

// Route to reset password
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  const updatePassword = await service.updatePassword(email, newPassword);

  res.json(updatePassword);
});

// const port = 3000;
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

module.exports = router;
