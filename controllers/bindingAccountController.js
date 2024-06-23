const express = require("express"),
router = express.Router();

const service = require("../services/bindingAccountServices");

router.get("/getExternalAccount", async (req, res) => {

  const getExternalAccount = await service.getExternalAccount();
  res.json(getExternalAccount)
});

router.post("/validateAccount", async (req, res) => {
  const { user_id, icafe_id, username: userBody, password: passwordBody } = req.body;

  try {
    const validateAccount = await service.validateAccount(user_id, icafe_id, userBody, passwordBody);

    if (!validateAccount) {
      res.status(404).json("Username Or Password is Wrong!");
    } else {
      res.json(validateAccount);
    }
  } catch (error) {
    console.error("Error validating account:", error);
    res.status(500).json("Internal Server Error");
  }
});

router.post("/insertAccount", async (req, res) => {
  const { icafe_id: icafeIdBody, user_id: userIdBody } = req.body;

  try {
    const insertResult = await service.insertAccount(icafeIdBody, userIdBody);

    if (insertResult.affectedRows != 0) {
      res.status(201).send("Account Created Successfully!");
    } else {
      res.status(404).send("Unsuccessful Account Creation");
    }
  } catch (error) {
    console.error("Error creating account:", error);
    res.status(500).send("Internal Server Error");
  }
});


module.exports = router;