const axios = require("axios");

// Test the AI Visa Checker endpoint
async function testAIVisaChecker() {
  const testData = {
    citizenship: "India",
    destination: "United States",
    purpose: "Tourism",
    age: 28,
    tripDuration: 14,
    email: "test@example.com",
    name: "John Doe",
  };

  try {
    console.log("Testing AI Visa Checker...");
    console.log("Request data:", JSON.stringify(testData, null, 2));

    const response = await axios.post(
      "http://localhost:4000/api/public/ai-visa-checker",
      testData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Success!");
    console.log("Response:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("❌ Error occurred:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Error message:", error.message);
    }
  }
}

// Run the test
testAIVisaChecker();
