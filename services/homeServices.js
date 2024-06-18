const {db, db2} = require("../db");

module.exports.getFeaturediCafes = async () => {
    const [icafes] = await db.query(
      "SELECT `name`, `address`, `rating` FROM `icafe_info` WHERE `featuredYN` = 'Y';"
    );
    return [icafes];
  };

module.exports.getPriceLabel = async() => {
    const [icafes] = await db.query(
      `SELECT icafe_id, avg_price,
      CASE
          WHEN avg_price > (total_average + 2000) THEN 'High Price'
          WHEN avg_price >= (total_average - 2000) AND avg_price <= (total_average + 2000) THEN 'Mid Price'
          ELSE 'Low Price'
      END AS price_label
  FROM (
      SELECT icafe_id, AVG(price) AS avg_price
      FROM icafe_details
      GROUP BY icafe_id
  ) subquery
  CROSS JOIN (
      SELECT ROUND(AVG(avg_price)) AS total_average
      FROM (
          SELECT AVG(price) AS avg_price
          FROM icafe_details
          GROUP BY icafe_id
      ) avg_subquery
  ) total_avg_subquery;`
    );
    return [icafes];
  };

module.exports.getAlliCafes = async () => {
    const [icafes] = await db.query(
      "SELECT `name`, `open_time`, `close_time`, `address`, `rating` FROM `icafe_info`;"
    );
    return icafes;
};  

module.exports.getSearchediCafes = async (iCafeName) => {
    const [icafes] = await db.query(
      "SELECT `name`, `open_time`, `close_time`, `address`, `rating` FROM `icafe_info` WHERE name = ?;",
      [iCafeName]
    );
    return [icafes];
  };
  
  module.exports.getUserBilling = async (accountId) => {
    const [billing] = await db2.query(
      "SELECT `regular_billing`, `vip_billing`, `vvip_billing` FROM `accounts` WHERE `account_id` = ?;",
      [accountId]
    );
    return [billing];
  };

  module.exports.getUsername = async (userId) => {
    const [username] = await db.query(
      "SELECT `username` FROM `icafe_users` WHERE `userid` = ?;",
      [userId]
    );
    return [username];
  };

  module.exports.getiCafeDetails = async (detailsId) => {
    const [details] = await db.query(
      "SELECT `pc_category`, `price`, `total_computers`, `available_computers` FROM `icafe_details` WHERE `icafe_detail_id` = ?;",
      [detailsId]
    );
    return [details];
  };

  module.exports.getComputerSpecs = async (detailsId) => {
    const [specs] = await db.query(
      "SELECT `pc_category`, `description` FROM `icafe_details` WHERE `icafe_detail_id` = ?;",
      [detailsId]
    );
    return [specs];
  };

  module.exports.geteWalletBalance = async (userId) => {
    const [balance] = await db.query(
      "SELECT `ewallet_balance` FROM `icafe_users` WHERE userid = ?;",
      [userId]
    );
    return [balance];
  };
  