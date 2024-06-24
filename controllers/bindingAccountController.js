const express = require("express"),
router = express.Router();

const service = require("../services/bindingAccountServices");

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

router.post("/unbindAccount", async (req, res) => {
  const binding_id = req.query.binding_id;

  try {
    const unbindResult = await service.unbindAccount(binding_id);

    res.status(201).send("Undbind Successfull!");
  } catch (error) {
    console.error("Error creating account:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/getBindAccount", async (req, res) => {
  const user_id = req.query.user_id;
  console.log(user_id)
  try {
    const insertResult = await service.getBindAccount(user_id);

    res.json(insertResult)
  } catch (error) {
    console.error("Error creating account:", error);
    res.status(500).send("Internal Server Error");
  }
});


module.exports = router;