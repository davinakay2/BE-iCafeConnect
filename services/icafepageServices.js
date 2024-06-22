const { db } = require("../db");

// Function to fetch all PC categories for a given icafe_id
module.exports.getPCCategories = async (icafe_id) => {
  try {
    const [categories] = await db.query(
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
    const [billingInfo] = await db.query(
      "SELECT icafe_detail_id, pc_category, total_computers, available_computers FROM icafe_details WHERE icafe_id = ? AND pc_category = ?;",
      [icafe_id, pc_category]
    );
    return billingInfo;
  } catch (error) {
    console.error("Error in getPCBillingInfo:", error);
    throw error; // Re-throw the error to propagate it up
  }
};

// Function to fetch computer specifications for a given icafe_detail_id
module.exports.getComputerSpecifications = async (icafe_detail_id) => {
  try {
    const [specifications] = await db.query(
      "SELECT icafe_detail_id, pc_category, description, processor, vga, monitor, keyboard, mouse, headset FROM icafe_details WHERE icafe_detail_id = ?;",
      [icafe_detail_id]
    );
    return specifications;
  } catch (error) {
    console.error("Error in getComputerSpecifications:", error);
    throw error; // Re-throw the error to propagate it up
  }
};

// Function to fetch billing prices for a given icafe_detail_id
module.exports.getBillingPrices = async (icafe_detail_id) => {
  try {
    const [prices] = await db.query(
      "SELECT billing_price_id, hours, price FROM billing_price WHERE icafe_detail_id = ?;",
      [icafe_detail_id]
    );
    return prices;
  } catch (error) {
    console.error("Error in getBillingPrices:", error);
    throw error; // Re-throw the error to propagate it up
  }
};