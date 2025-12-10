const rateLimit = require("express-rate-limit");

/**
 * Rate limiter specifically for AI-powered endpoints
 * Prevents abuse and protects AI API usage
 */
const aiEndpointRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
    retryAfter: "15 minutes"
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Use IP address from request
  keyGenerator: (req) => {
    // Get IP from various sources (handles proxies/load balancers)
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
           'unknown';
  },
  // Custom handler for rate limit exceeded
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please wait before making another request.",
      error: "Rate limit exceeded",
      retryAfter: "15 minutes"
    });
  },
  // Skip rate limiting for certain conditions (optional - can be used for whitelist)
  skip: (req) => {
    // You can add admin IPs or API keys here if needed
    return false;
  }
});

/**
 * Stricter rate limiter for daily limits
 * Prevents excessive daily usage
 */
const dailyRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // Limit each IP to 20 requests per day
  message: {
    success: false,
    message: "Daily request limit exceeded. Please try again tomorrow.",
    retryAfter: "24 hours"
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
           'unknown';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Daily request limit exceeded. Please try again tomorrow.",
      error: "Daily rate limit exceeded",
      retryAfter: "24 hours"
    });
  }
});

/**
 * Request size validator middleware
 * Prevents oversized requests that could abuse the system
 */
const validateRequestSize = (req, res, next) => {
  const contentLength = req.headers['content-length'];
  const maxSize = 100 * 1024; // 100KB max request size
  
  if (contentLength && parseInt(contentLength) > maxSize) {
    return res.status(413).json({
      success: false,
      message: "Request payload too large. Maximum size is 100KB.",
      error: "Payload too large"
    });
  }
  
  // Also check actual body size if available
  if (req.body && JSON.stringify(req.body).length > maxSize) {
    return res.status(413).json({
      success: false,
      message: "Request payload too large. Maximum size is 100KB.",
      error: "Payload too large"
    });
  }
  
  next();
};

/**
 * Request timeout middleware
 * Prevents long-running requests from blocking the server
 */
const requestTimeout = (timeoutMs = 30000) => {
  return (req, res, next) => {
    req.setTimeout(timeoutMs, () => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          message: "Request timeout. Please try again with a smaller payload.",
          error: "Request timeout"
        });
      }
    });
    next();
  };
};

module.exports = {
  aiEndpointRateLimiter,
  dailyRateLimiter,
  validateRequestSize,
  requestTimeout
};

