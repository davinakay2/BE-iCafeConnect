const express = require("express"),
router = express.Router();

const service = require("../services/homeServices");
const multer = require("multer");
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({ keyFilename: '../services/homeServices.json' }); // Ensure you have the right permissions
const bucket = storage.bucket('promo-bucket');
const app = express();
// const port = 3000;

const upload = multer({
  storage: multer.memoryStorage(),
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

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).send('No file uploaded.');
      return;
    }

    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on('error', (err) => {
      console.error(err);
      res.status(500).send('Upload error');
    });

    blobStream.on('finish', () => {
      res.status(200).send('File uploaded.');
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Upload error');
  }
});

app.get('/image/:filename', async (req, res) => {
  const { filename } = req.params;
  const file = bucket.file(filename);

  try {
    const [metadata] = await file.getMetadata();
    res.setHeader('Content-Type', metadata.contentType);

    file.createReadStream()
      .on('error', err => {
        console.error(err);
        res.status(500).send('Error retrieving the image');
      })
      .pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving the image');
  }
});

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
      const [username] = await service.getUsername();
      res.json(username);
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