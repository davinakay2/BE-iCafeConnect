const {
  getDatabaseById,
  getDatabaseNameById,
  db,
  db1,
  db2,
  db3,
} = require("../db");
const path = require("path");
const fs = require("fs");

module.exports.getFeaturediCafes = async () => {
  try {
    const [icafes] = await db.query(
      "SELECT name, address, rating, image_url, icafe_id, open_time, close_time FROM icafe_info WHERE rating > 4.5;"
    );
    console.log(icafes);
    // Format the image URLs to include the server base URL and convert to base64
    const formattedICafes = icafes.map((icafe) => {
      const serverBaseUrl = "http://localhost:3000";
      if (icafe.image_url) {
        const imagePath = path.join(__dirname, "..", icafe.image_url);
        if (fs.existsSync(imagePath)) {
          const image = fs.readFileSync(imagePath);
          const base64Image = Buffer.from(image).toString("base64");
          return {
            ...icafe,
            image_url: `${serverBaseUrl}${icafe.image_url}`,
            image: base64Image,
          };
        } else {
          return {
            ...icafe,
            image_url: `${serverBaseUrl}${icafe.image_url}`,
            image: null,
          };
        }
      }
      return icafe;
    });

    return formattedICafes;
  } catch (error) {
    console.error("Error fetching iCafes:", error);
    throw error; // Propagate the error to be handled by the caller
  }
};

module.exports.getAlliCafes = async () => {
  try {
    // const [icafes] = await db.query(
    //   `SELECT
    //     ii.icafe_id,
    //     ii.name,
    //     ii.open_time,
    //     ii.close_time,
    //     ii.address,
    //     ii.rating,
    //     ii.image_url,
    //     CASE
    //         WHEN bp.price < 15000 THEN '$'
    //         WHEN bp.price >= 15000 AND bp.price < 20000 THEN '$$'
    //         ELSE '$$$'
    //     END AS price_category
    //     FROM
    //         icafe_info ii
    //     JOIN
    //         icafe_details id ON ii.icafe_id = id.icafe_id
    //     JOIN
    //         billing_price bp ON id.icafe_detail_id = bp.icafe_detail_id
    //     WHERE
    //         id.pc_category = 'Regular'
    //         AND bp.hours = 1;`
    // );
    // // Format the image URLs to include the server base URL and convert to base64
    // const formattedICafes = icafes.map((icafe) => {
    //   const serverBaseUrl = "http://localhost:3000"; // Update with your server's base URL
    //   if (icafe.image_url) {
    //     const imagePath = path.join(__dirname, "..", icafe.image_url);
    //     if (fs.existsSync(imagePath)) {
    //       const image = fs.readFileSync(imagePath);
    //       const base64Image = Buffer.from(image).toString("base64");
    //       return {
    //         ...icafe,
    //         image_url: `${serverBaseUrl}${icafe.image_url}`,
    //         image: base64Image,
    //       };
    //     } else {
    //       return {
    //         ...icafe,
    //         image_url: `${serverBaseUrl}${icafe.image_url}`,
    //         image: null,
    //       };
    //     }
    //   }
    //   return icafe;
    // });

    // Step 1: Retrieve all icafe_info from the main database
    const [icafes] = await db.query(`
        SELECT 
            ii.icafe_id, 
            ii.name, 
            ii.open_time, 
            ii.close_time, 
            ii.address, 
            ii.rating, 
            ii.image_url
        FROM 
            icafe_info ii;
    `);

    // Step 2: For each iCafe, retrieve the details from the correct database
    const icafeDataPromises = icafes.map(async (icafe) => {
      const { icafe_id, image_url } = icafe;
      const databaseName = getDatabaseNameById(icafe_id);

      if (!databaseName) {
        throw new Error(`No database mapping found for icafe_id: ${icafe_id}`);
      }

      const selectedDb = getDatabaseById(icafe_id);

      const [details] = await selectedDb.query(
        `
            SELECT 
                CASE
                    WHEN bp.price < 15000 THEN '$'
                    WHEN bp.price >= 15000 AND bp.price < 20000 THEN '$$'
                    ELSE '$$$'
                END AS price_category
            FROM 
                icafe_details id
            JOIN 
                billing_price bp ON id.icafe_detail_id = bp.icafe_detail_id
            WHERE 
                id.pc_category = 'Regular'
                AND bp.hours = 1;
        `,
        [icafe_id]
      );

      let formattedICafe = {
        ...icafe,
        price_category: details.length > 0 ? details[0].price_category : null,
      };

      // Step 3: Format the image URLs and convert to base64
      const serverBaseUrl = "http://localhost:3000"; // Update with your server's base URL
      if (image_url) {
        const imagePath = path.join(__dirname, "..", image_url);
        if (fs.existsSync(imagePath)) {
          const image = fs.readFileSync(imagePath);
          const base64Image = Buffer.from(image).toString("base64");
          formattedICafe = {
            ...formattedICafe,
            image_url: `${serverBaseUrl}${image_url}`,
            image: base64Image,
          };
        } else {
          formattedICafe = {
            ...formattedICafe,
            image_url: `${serverBaseUrl}${image_url}`,
            image: null,
          };
        }
      }

      return formattedICafe;
    });

    // Step 4: Wait for all promises to resolve and return the combined data
    const formattedICafes = await Promise.all(icafeDataPromises);
    return formattedICafes;
  } catch (error) {
    console.error("Error fetching iCafes:", error);
    throw error; // Propagate the error to be handled by the caller
  }
};

module.exports.getAdsiCafes = async () => {
  try {
    const [icafes] = await db.query(
      `SELECT icafe_id, name, ads_url FROM icafe_info
       WHERE adsYN = "Y";`
    );
    // Format the image URLs to include the server base URL and convert to base64
    const formattedAdsiCafes = icafes.map((icafe) => {
      const serverBaseUrl = "http://localhost:3000"; // Update with your server's base URL
      if (icafe.ads_url) {
        const imagePath = path.join(__dirname, "..", icafe.ads_url);
        if (fs.existsSync(imagePath)) {
          const image = fs.readFileSync(imagePath);
          const base64Image = Buffer.from(image).toString("base64");
          return {
            ...icafe,
            ads_url: `${serverBaseUrl}${icafe.ads_url}`,
            image: base64Image,
          };
        } else {
          return {
            ...icafe,
            ads_url: `${serverBaseUrl}${icafe.ads_url}`,
            image: null,
          };
        }
      }
      return icafe;
    });

    return formattedAdsiCafes;
  } catch (error) {
    console.error("Error fetching iCafes:", error);
    throw error; // Propagate the error to be handled by the caller
  }
};

module.exports.getSearchediCafes = async (iCafeName) => {
  const [icafes] = await db.query(
    "SELECT name, open_time, close_time, address, rating FROM icafe_info WHERE name = ?;",
    [iCafeName]
  );
  return [icafes];
};

module.exports.getUserBilling = async (username, icafe_id) => {
  const selectedDb = getDatabaseById(icafe_id);

  // Check if the connection pool is still open
  if (!selectedDb || selectedDb._closing || selectedDb._closed) {
    console.warn(
      `Database connection for iCafe ID ${icafe_id} is closed. Reinitializing connection...`
    );

    // Reinitialize the connection here
    selectedDb = await reinitializeDatabaseConnection(icafe_id);

    if (!selectedDb) {
      throw new Error(
        `Failed to reinitialize database connection for iCafe ID ${icafe_id}`
      );
    }
  }

  try {
    const [billing] = await selectedDb.query(
      "SELECT regular_billing, vip_billing, vvip_billing FROM accounts WHERE username = ?;",
      [username]
    );
    return billing[0];
  } catch (error) {
    console.error(
      `Error fetching billing info for username "${username}" in iCafe ID ${icafe_id}:`,
      error
    );
    throw error;
  }
};

module.exports.getUsername = async (userId) => {
  const [result] = await db.query(
    "SELECT username FROM icafe_users WHERE userid = ?;",
    [userId]
  );
  return result[0];
};

module.exports.geteWalletBalance = async (userId) => {
  const [balance] = await db.query(
    "SELECT ewallet_balance FROM icafe_users WHERE userid = ?;",
    [userId]
  );
  return balance[0];
};
