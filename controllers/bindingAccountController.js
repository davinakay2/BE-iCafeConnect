const express = require("express"),
  router = express.Router();

  const service = require("../services/bindingAccountServices");

router.get("/getExternalAccount", async (req, res) => {

  const getExternalAccount = await service.getExternalAccount();
  res.json(getExternalAccount)
});

router.get("/validateAccount", async (req, res) => {
  const userBody = req.body.user;
  const passwordBody = req.body.password;
  const validateAccount = await service.validateAccount(userBody, passwordBody);
  if (validateAccount.length == 0) {
    res.status(404).json("Username Or Password is Wrong!");
  }
  res.json(validateAccount)
});

router.post("/insertAccount", async (req, res) => {
  const {
    username: usernameBody,
    password: passwordBody,
  } = req.body;

  const iccUsername = `icc${usernameBody}`;

  const affectedRows = await service.insertAccount(
    iccUsername,
    passwordBody,
  );
  if (affectedRows != 0) {
    res.status(201).send("Account Created Successfully!");
  } else {
    res.status(404).send("Unsuccessfull Account Creation");
  }
});

router.put("/unbindAccount", async (req, res) => {
  const userBody = req.body.user;
  const unbindAccount = await service.unbindAccount(userBody);

  res.status(404).json("Unbinded Successfully!");
});


module.exports = router;