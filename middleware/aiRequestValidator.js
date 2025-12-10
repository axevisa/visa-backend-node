/**
 * Input validation and sanitization middleware for AI endpoints
 * Prevents malicious input and validates data structure
 */

const validateAIRequest = (req, res, next) => {
  const userData = req.body;

  // Check if body exists
  if (!userData || typeof userData !== 'object') {
    return res.status(400).json({
      success: false,
      message: "Invalid request body. Expected JSON object.",
      error: "Invalid request format"
    });
  }

  // Validate required fields
  const requiredFields = [
    "citizenship",
    "destination",
    "purpose",
    "age",
    "tripDuration",
    "email",
    "name",
    "phone"
  ];

  const missingFields = [];
  for (const field of requiredFields) {
    if (!userData[field] && userData[field] !== 0) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(", ")}`,
      error: "Validation error",
      missingFields
    });
  }

  // Validate data types and ranges
  const errors = [];

  // Age validation
  if (typeof userData.age !== 'number' || userData.age < 1 || userData.age > 120) {
    errors.push("Age must be a number between 1 and 120");
  }

  // Trip duration validation
  if (typeof userData.tripDuration !== 'number' || userData.tripDuration < 1 || userData.tripDuration > 365) {
    errors.push("Trip duration must be a number between 1 and 365 days");
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof userData.email !== 'string' || !emailRegex.test(userData.email)) {
    errors.push("Invalid email format");
  }

  // String length validations
  if (typeof userData.name !== 'string' || userData.name.trim().length < 2 || userData.name.trim().length > 100) {
    errors.push("Name must be between 2 and 100 characters");
  }

  if (typeof userData.citizenship !== 'string' || userData.citizenship.trim().length < 2 || userData.citizenship.trim().length > 100) {
    errors.push("Citizenship must be between 2 and 100 characters");
  }

  if (typeof userData.destination !== 'string' || userData.destination.trim().length < 2 || userData.destination.trim().length > 100) {
    errors.push("Destination must be between 2 and 100 characters");
  }

  if (typeof userData.purpose !== 'string' || userData.purpose.trim().length < 2 || userData.purpose.trim().length > 100) {
    errors.push("Purpose must be between 2 and 100 characters");
  }

  // Phone validation (basic)
  if (typeof userData.phone !== 'string' || userData.phone.trim().length < 5 || userData.phone.trim().length > 20) {
    errors.push("Phone must be between 5 and 20 characters");
  }

  // Validate optional fields if provided
  if (userData.bankSavings !== undefined) {
    if (typeof userData.bankSavings !== 'number' || userData.bankSavings < 0 || userData.bankSavings > 1000000000) {
      errors.push("Bank savings must be a number between 0 and 1,000,000,000");
    }
  }

  if (userData.monthlyIncome !== undefined) {
    if (typeof userData.monthlyIncome !== 'number' || userData.monthlyIncome < 0 || userData.monthlyIncome > 10000000) {
      errors.push("Monthly income must be a number between 0 and 10,000,000");
    }
  }

  // Validate arrays if provided
  if (userData.visitedCountries !== undefined && !Array.isArray(userData.visitedCountries)) {
    errors.push("visitedCountries must be an array");
  }

  if (userData.rejectionCountries !== undefined && !Array.isArray(userData.rejectionCountries)) {
    errors.push("rejectionCountries must be an array");
  }

  if (userData.availableDocuments !== undefined && !Array.isArray(userData.availableDocuments)) {
    errors.push("availableDocuments must be an array");
  }

  // Limit array sizes to prevent abuse
  if (Array.isArray(userData.visitedCountries) && userData.visitedCountries.length > 50) {
    errors.push("visitedCountries array cannot exceed 50 items");
  }

  if (Array.isArray(userData.rejectionCountries) && userData.rejectionCountries.length > 20) {
    errors.push("rejectionCountries array cannot exceed 20 items");
  }

  if (Array.isArray(userData.availableDocuments) && userData.availableDocuments.length > 20) {
    errors.push("availableDocuments array cannot exceed 20 items");
  }

  // Sanitize string inputs (trim whitespace)
  if (typeof userData.name === 'string') {
    userData.name = userData.name.trim();
  }
  if (typeof userData.email === 'string') {
    userData.email = userData.email.trim().toLowerCase();
  }
  if (typeof userData.citizenship === 'string') {
    userData.citizenship = userData.citizenship.trim();
  }
  if (typeof userData.destination === 'string') {
    userData.destination = userData.destination.trim();
  }
  if (typeof userData.purpose === 'string') {
    userData.purpose = userData.purpose.trim();
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      error: "Validation error",
      errors
    });
  }

  next();
};

module.exports = {
  validateAIRequest
};

