const { db, db1, db2, db3 } = require("../db");
const path = require("path");
const fs = require("fs");
const getDatabaseById = (icafe_id) => {
  switch (icafe_id) {
    case 1:
      return db1;
    case 2:
      return db2;
    case 3:
      return db3;
    default:
      return db;
  }
};

module.exports.getCafeImageUrl = async (icafeId) => {
  const [result] = await db.query(
    "SELECT icafe_image_url FROM icafe_info WHERE icafe_id = ?",
    [icafeId]
  );
  return result.length ? result[0].icafe_image_url : null;
};

module.exports.getPromoBanner = async () => {
  const [result] = await db.query(
    "SELECT banner_url FROM promotions WHERE promoid = 1"
  );
  return result.length ? result[0].banner_url : null;
};

module.exports.getFeaturediCafes = async () => {
  try {
    const [icafes] = await db.query(
      "SELECT name, address, rating, icafe_image_url, icafe_id FROM icafe_info WHERE featuredYN = 'Y';"
    );
    console.log(icafes);
    // Format the image URLs to include the server base URL and convert to base64
    const formattedICafes = icafes.map((icafe) => {
      const serverBaseUrl = "http://localhost:3000"; // Update with your server's base URL
      if (icafe.icafe_image_url) {
        const imagePath = path.join(__dirname, "..", icafe.icafe_image_url);
        if (fs.existsSync(imagePath)) {
          const image = fs.readFileSync(imagePath);
          const base64Image = Buffer.from(image).toString("base64");
          return {
            ...icafe,
            icafe_image_url: `${serverBaseUrl}${icafe.icafe_image_url}`,
            image: base64Image,
          };
        } else {
          return {
            ...icafe,
            icafe_image_url: `${serverBaseUrl}${icafe.icafe_image_url}`,
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

// module.exports.getPriceLabel = async() => {
//     const [icafes] = await db.query(
//       `SELECT icafe_id, avg_price,
//       CASE
//           WHEN avg_price > (total_average + 2000) THEN 'High Price'
//           WHEN avg_price >= (total_average - 2000) AND avg_price <= (total_average + 2000) THEN 'Mid Price'
//           ELSE 'Low Price'
//       END AS price_label
//   FROM (
//       SELECT icafe_id, AVG(price) AS avg_price
//       FROM icafe_details
//       GROUP BY icafe_id
//   ) subquery
//   CROSS JOIN (
//       SELECT ROUND(AVG(avg_price)) AS total_average
//       FROM (
//           SELECT AVG(price) AS avg_price
//           FROM icafe_details
//           GROUP BY icafe_id
//       ) avg_subquery
//   ) total_avg_subquery;`
//     );
//     return [icafes];
//   };

// Example service method to fetch iCafes from the database
module.exports.getAlliCafes = async () => {
  try {
    const [icafes] = await db.query(
      "SELECT icafe_id, name, open_time , close_time, address, rating, icafe_image_url FROM icafe_info;"
    );

    // Format the image URLs to include the server base URL and convert to base64
    const formattedICafes = icafes.map((icafe) => {
      const serverBaseUrl = "http://localhost:3000"; // Update with your server's base URL
      if (icafe.icafe_image_url) {
        const imagePath = path.join(__dirname, "..", icafe.icafe_image_url);
        if (fs.existsSync(imagePath)) {
          const image = fs.readFileSync(imagePath);
          const base64Image = Buffer.from(image).toString("base64");
          return {
            ...icafe,
            icafe_image_url: `${serverBaseUrl}${icafe.icafe_image_url}`,
            image: base64Image,
          };
        } else {
          return {
            ...icafe,
            icafe_image_url: `${serverBaseUrl}${icafe.icafe_image_url}`,
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

module.exports.getSearchediCafes = async (iCafeName) => {
  const [icafes] = await db.query(
    "SELECT name, open_time, close_time, address, rating FROM icafe_info WHERE name = ?;",
    [iCafeName]
  );
  return [icafes];
};

module.exports.getUserBilling = async (username, icafe_id) => {
  const selectedDb = getDatabaseById(icafe_id);
  const [billing] = await selectedDb.query(
    "SELECT regular_billing, vip_billing, vvip_billing FROM binding_account WHERE username_binding = ?;",
    [username]
  );

  return billing[0];
};
module.exports.getUsername = async (userId) => {
  const [result] = await db.query(
    "SELECT username FROM icafe_users WHERE userid = ?;",
    [userId]
  );
  return result[0];
};

module.exports.getPCCategories = async (icafe_id) => {
  try {
    const selectedDb = getDatabaseById(icafe_id);
    const [categories] = await selectedDb.query(
      "SELECT pc_category FROM icafe_details WHERE icafe_id = ?;",
      [icafe_id]
    );
    return categories.map((category) => category.pc_category);
  } catch (error) {
    throw new Error(`Error fetching PC categories: ${error.message}`);
  }
};

module.exports.getiCafeDetails = async (detailsId, icafe_id) => {
  const selectedDb = getDatabaseById(icafe_id);
  const [details] = await selectedDb.query(
    "SELECT pc_category, price, total_computers, available_computers FROM icafe_details WHERE icafe_detail_id = ?;",
    [detailsId]
  );
  return [details];
};

module.exports.getComputerSpecs = async (detailsId, icafe_id) => {
  const selectedDb = getDatabaseById(icafe_id);
  const [specs] = await selectedDb.query(
    "SELECT pc_category, description FROM icafe_details WHERE icafe_detail_id = ?;",
    [detailsId]
  );
  return [specs];
};

module.exports.geteWalletBalance = async (userId) => {
  const [balance] = await db.query(
    "SELECT ewallet_balance FROM icafe_users WHERE userid = ?;",
    [userId]
  );
  return balance[0];
};
