const {db, db1, db2, db3} = require("../db");

const getDatabaseById = (icafe_id) => {
  switch(icafe_id) {
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

module.exports.getPromoBanner = async () => {
  const [result] = await db.query(
    "SELECT banner_url FROM promotions WHERE promoid = 1"
  );
  return result.length ? result[0].banner_url : null;
};

module.exports.getFeaturediCafes = async () => {
    const [icafes] = await db.query(
      "SELECT name, address, rating FROM icafe_info WHERE featuredYN = 'Y';"
    );
    return [icafes];
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

module.exports.getAlliCafes = async () => {
  const [icafes] = await db.query(
    "SELECT icafe_id, name, open_time, close_time, address, rating FROM icafe_info;"
  );
  return [icafes];
};

module.exports.getSearchediCafes = async (iCafeName) => {
    const [icafes] = await db.query(
      "SELECT name, open_time, close_time, address, rating FROM icafe_info WHERE name = ?;",
      [iCafeName]
    );
    return [icafes];
  };

  module.exports.getiCafeUserData = async (userId, icafe_id) => {
    try {
      const selectedDb = getDatabaseById(icafe_id);
      const [username] = await selectedDb.query(
        "SELECT username FROM icafe_users WHERE userid = ?;",
        [userId]
      );
  
      const [userBilling] = await db2.query(
        "SELECT regular_billing, vip_billing, vvip_billing FROM accounts WHERE account_id = ?;",
        [userId] // Assuming account_id is the same as userId
      );
  
      const [pcCategories] = await selectedDb.query(
        "SELECT pc_category FROM icafe_details WHERE icafe_id = ?;",
        [icafe_id]
      );
  
      return {
        username: username.length ? username[0].username : null,
        billing: userBilling.length ? userBilling[0] : null,
        pcCategories: pcCategories.map(category => category.pc_category)
      };
    } catch (error) {
      throw new Error(`Error fetching user data: ${error.message}`);
    }
  };
  
  module.exports.getUserBilling = async (accountId) => {
    const [billing] = await db2.query(
      "SELECT regular_billing, vip_billing, vvip_billing FROM accounts WHERE account_id = ?;",
      [accountId]
    );
    return [billing];
  };
  
  module.exports.getUsername = async (userId, icafe_id) => {
    const selectedDb = getDatabaseById(icafe_id);
    const [result] = await selectedDb.query(
      "SELECT username FROM icafe_users WHERE userid = ?;",
      [userId]
    );
    return result;
  };
  
  module.exports.getPCCategories = async (icafe_id) => {
    try {
      const selectedDb = getDatabaseById(icafe_id);
      const [categories] = await selectedDb.query(
        "SELECT pc_category FROM icafe_details WHERE icafe_id = ?;",
        [icafe_id]
      );
      return categories.map(category => category.pc_category);
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
    return balance;
  };
  