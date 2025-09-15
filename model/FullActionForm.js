const mongoose = require("mongoose");

const FullActionFromScheme = new mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    dateofbirth: {
        type: Date
    },
    nationality: {
        type: String
    },
    visa_type: {
        type: String
    },
    perpose: {
        type: String
    },
    travel_date: {
        type: Date
    },
    stay_duration: {
        type: String
    },
    occupation: {
        type: String
    },
    employer: {
        type: String
    },
    education_lavel: {
        type: String
    },
    marital_status: {
        type: String
    },
    additional_info: {
        type: String
    },
    form_type: {
        type: String
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    documents: {
        passport: {
            type: [String],
            default: []
        },
        photo: {
            type: [String],
            default: []
        },
        financial_doc: {
            type: [String],
            default: []
        },
        supportingDocument: {
            type: [String],
            default: []
        }
    }
},
    { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("FullActionForm", FullActionFromScheme);

