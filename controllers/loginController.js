const express = require("express"),
  router = express.Router();

const service = require("../services/loginServices");

router.get("/login", async (req, res) => {
  const userBody = req.body.user;
  const passwordBody = req.body.password;

  const userValidation = await service.userValidity(userBody);
  if (userValidation.length == 0) {
    res.status(404).json("Account is not Registered!");
  } else {
    const user = await service.loginVerification(userBody, passwordBody);
    if (user.length == 0) {
      res.status(404).json("Username/Email Or Password is Wrong!");
    }
    res.send(user);
  }
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
  if (userValidation != 0) {
    res.status(404).send("Username is Taken!");
  }
  const emailValidity = await service.emailValidity(emailBody);
  if (emailValidity != 0) {
    res.status(404).send("Email is Taken!");
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

module.exports = router;
