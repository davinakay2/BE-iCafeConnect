const {
  getDatabaseById,
  getDatabaseNameById,
  db,
  db1,
  db2,
  db3,
} = require("../db");

// Function to fetch all PC categories for a given icafe_id
module.exports.getPCCategories = async (icafe_id) => {
  try {
    const selectedDb = getDatabaseById(icafe_id);

    const [categories] = await selectedDb.query(
      "SELECT DISTINCT pc_category FROM icafe_details WHERE icafe_id = ?;",
      [icafe_id]
    );
    return categories;
  } catch (error) {
    console.error("Error in getPCCategories:", error);
    throw error; // Re-throw the error to propagate it up
  }
};

// Function to fetch PC billing info for a specific pc_category
module.exports.getPCBillingInfo = async (icafe_id, pc_category) => {
  try {
    const selectedDb = getDatabaseById(icafe_id);
    console.log(selectedDb);
    console.log(icafe_id);

    const [billingInfo] = await selectedDb.query(
      "SELECT icafe_detail_id, pc_category, total_computers, available_computers FROM icafe_details WHERE pc_category = ?;",
      [pc_category]
    );
    return billingInfo[0];
  } catch (error) {
    console.error("Error in getPCBillingInfo:", error);
    throw error; // Re-throw the error to propagate it up
  }
};

// Function to fetch computer specifications for a given icafe_detail_id
module.exports.getComputerSpecifications = async (
  icafe_detail_id,
  icafe_id
) => {
  try {
    const selectedDb = getDatabaseById(icafe_id);

    const [specifications] = await selectedDb.query(
      "SELECT icafe_detail_id, pc_category, description, processor, vga, monitor, keyboard, mouse, headset FROM icafe_details WHERE icafe_detail_id = ?;",
      [icafe_detail_id]
    );
    return specifications[0];
  } catch (error) {
    console.error("Error in getComputerSpecifications:", error);
    throw error; // Re-throw the error to propagate it up
  }
};

// Function to fetch billing prices for a given icafe_detail_id
module.exports.getBillingPrices = async (icafe_detail_id, icafe_id) => {
  console.log(icafe_id);

  try {
    console.log("icafe_id:", icafe_id);
    const selectedDb = getDatabaseById(icafe_id);

    const [prices] = await selectedDb.query(
      "SELECT billing_price_id, hours, price FROM billing_price WHERE icafe_detail_id = ?;",
      [icafe_detail_id]
    );
    return prices;
  } catch (error) {
    console.error("Error in getBillingPrices:", error);
    throw error; // Re-throw the error to propagate it up
  }
};
