const mongoose = require("mongoose");

const visaAssessmentSchema = new mongoose.Schema(
    {
        // Personal Details (Not sent to AI)
        personalDetails: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true },
        },

        // Visa Application Details (Sent to AI)
        applicationDetails: {
            citizenship: { type: String, required: true },
            destination: { type: String, required: true },
            purpose: { type: String, required: true },
            age: { type: Number, required: true },
            tripDuration: { type: Number, required: true },
            previousRejections: { type: String, enum: ["yes", "no"], default: "no" },
            rejectionCountries: [String],
            rejectionDetails: String,
            criminalRecord: { type: String, enum: ["yes", "no"], default: "no" },
            criminalDetails: String,
            noTravelHistory: { type: Boolean, default: false },
            visitedCountries: [String],
            bankSavings: Number,
            monthlyIncome: Number,
            employmentStatus: String,
            companySchool: String,
            availableDocuments: [String],
        },

        // AI Analysis Result
        aiAnalysis: {
            visaChance: { type: Number, required: true }, // Percentage 0-100
            positivePoints: [String],
            negativePoints: [String],
            riskFactors: [String],
            recommendedDocuments: [String],
            finalAdvice: { type: String, required: true },
            analyzedAt: { type: Date, default: Date.now },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("VisaAssessment", visaAssessmentSchema);
