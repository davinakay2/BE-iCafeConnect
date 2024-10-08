const express = require("express"),
  router = express.Router();

const service = require("../services/bindingAccountServices");

router.post("/validateAccount", async (req, res) => {
  const {
    user_id,
    icafe_id,
    username: userBody,
    password: passwordBody,
  } = req.body;
  console.log(req.body);
  try {
    const validateAccount = await service.validateAccount(
      user_id,
      icafe_id,
      userBody,
      passwordBody
    );

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

    console.log(insertResult);

    if (insertResult.affectedRows != 0) {
      res.status(200).send(insertResult);
    } else {
      res.status(404).send(insertResult);
    }
  } catch (error) {
    console.error("Error creating account:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/unbindAccount", async (req, res) => {
  const binding_id = req.body.bindingId;
  console.log(binding_id);
  try {
    const unbindResult = await service.unbindAccount(binding_id);
    res.status(201).json({
      message: "Unbind Successful!",
      data: unbindResult,
    });
  } catch (error) {
    console.error("Error unbinding account:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/getBindAccount", async (req, res) => {
  const user_id = req.query.user_id;
  console.log(req.query.user_id);
  try {
    const insertResult = await service.getBindAccount(user_id);
    console.log(user_id);
    res.json(insertResult);
  } catch (error) {
    console.error("Error creating account:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
