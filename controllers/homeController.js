const express = require("express"),
  router = express.Router();

const service = require("../services/homeServices");

router.get("/getFeaturediCafes", async (req, res) => {
    try {
        const [featurediCafes] = await service.getFeaturediCafes();
        res.json(featurediCafes);
      } catch (error) {
        console.error("Error fetching featured iCafes:", error);
        res.status(500).send("An error occurred while fetching featured iCafes.");
      }

});

router.get("/getPriceLabel", async (req,res) => {
  const [priceLabeliCafes] = await service.getPriceLabel();
  console.log(priceLabeliCafes);
  res.json(priceLabeliCafes);
})

module.exports = router;