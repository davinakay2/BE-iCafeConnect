const express = require("express"),
router = express.Router();
const service = require("../services/homeServices");

router.get('/getPromoBanner', async (req, res) => {
  try {
    const bannerUrl = await service.getPromoBanner();
    if (bannerUrl) {
      res.status(200).json({ success: true, bannerUrl });
    } else {
      res.status(404).json({ success: false, message: 'Promo banner not found' });
    }
  } catch (error) {
    console.error('Error fetching promo banner:', error);
    res.status(500).json({ success: false, message: 'An error occurred while fetching promo banner' });
  }
});

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

router.get("/getAlliCafes", async (req, res) => {
  try {
      const [alliCafes] = await service.getAlliCafes();
      res.json(alliCafes);
    } catch (error) {
      console.error("Error fetching all iCafes:", error);
      res.status(500).send("An error occurred while fetching all iCafes.");
    }

});

router.get('/getSearchediCafes', async (req, res) => {
  const { iCafeName } = req.query; 

  try {
    const icafes = await service.getSearchediCafes(iCafeName);

    if (icafes.length > 0) {
      res.status(200).json({ success: true, icafes });
    } else {
      res.status(404).json({ success: false, message: 'No iCafes found with the given name' });
    }
  } catch (error) {
    console.error('Error fetching iCafes:', error);
    res.status(500).json({ success: false, message: 'An error occurred while fetching iCafes' });
  }
});

router.get("/getUserBilling", async (req, res) => {
  try {
      const [userBilling] = await service.getUserBilling();
      res.json(userBilling);
    } catch (error) {
      console.error("Error fetching user billing:", error);
      res.status(500).send("An error occurred while fetching user billing.");
    }

});

router.get("/getUsername", async (req, res) => {
  try {
    const userId = req.query.userid;
    if (!userId) {
      return res.status(400).json({ error: "Missing userid parameter" });
    }

    const [username] = await service.getUsername(userId);
    if (username) {
      res.json(username);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching username:", error);
    res.status(500).send("An error occurred while fetching username.");
  }
});


router.get("/getiCafeDetails", async (req, res) => {
  try {
      const [details] = await service.getiCafeDetails();
      res.json(details);
    } catch (error) {
      console.error("Error fetching iCafe details:", error);
      res.status(500).send("An error occurred while fetching iCafe details.");
    }

});

router.get("/getComputerSpecs", async (req, res) => {
  try {
      const [specs] = await service.getComputerSpecs();
      res.json(specs);
    } catch (error) {
      console.error("Error fetching computer specifications:", error);
      res.status(500).send("An error occurred while fetching computer specifications.");
    }

});

router.get("/geteWalletBalance", async (req, res) => {
  try {
      const [balance] = await service.geteWalletBalance();
      res.json(balance);
    } catch (error) {
      console.error("Error fetching e-Wallet balance:", error);
      res.status(500).send("An error occurred while fetching e-Wallet Balance.");
    }

});

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

module.exports = router;