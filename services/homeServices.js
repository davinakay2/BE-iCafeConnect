const db = require("../db");

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
  }