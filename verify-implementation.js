const { aiVisaChecker } = require("./controllers/publicController");

// Mock Mongoose Model
const mockSave = jest.fn().mockResolvedValue({ _id: "mock_id", createdAt: new Date() });
jest.mock("./model/VisaAssessment", () => {
    return jest.fn().mockImplementation((data) => {
        console.log("📝 [MOCK] VisaAssessment created with data:", JSON.stringify(data, null, 2));
        // Verify privacy
        if (data.applicationDetails.name || data.applicationDetails.email) {
            console.error("❌ PRIVACY FAIL: Personal data found in applicationDetails!");
        } else {
            console.log("✅ PRIVACY PASS: No personal data in applicationDetails.");
        }
        return { save: mockSave };
    });
});
const req = {
    body: {
        citizenship: "TestCountry",
        destination: "TestDest",
        purpose: "Tourism",
        age: 30,
        tripDuration: 10,
        email: "private@email.com",
        name: "Private Name",
        phone: "1234567890",
        bankSavings: 5000,
    },
};

const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockImplementation((data) => {
        console.log("📤 [MOCK] Response sent:", JSON.stringify(data, null, 2));
    }),
};

// Run Test
console.log("🚀 Starting Verification...");
aiVisaChecker(req, res).then(() => {
    console.log("🏁 Verification Complete.");
});
