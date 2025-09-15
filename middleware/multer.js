// middlewares/dynamicUpload.js
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function dynamicUpload(
  folderName = "",
  fields = [{ name: "image", maxCount: 5 }]
) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const baseDir = path.join(process.cwd(), "uploads", folderName);
      if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
      }
      cb(null, baseDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = crypto.randomBytes(8).toString("hex");
      const filename = uniqueSuffix + path.extname(file.originalname);
      file._customRelativePath = `/uploads/${folderName}/${filename}`;
      cb(null, filename);
    },
  });

  const upload = multer({ storage });

  return (req, res, next) => {
    upload.fields(fields)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Handle multer-specific errors
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: "Unexpected file field. Please check the file field names in your request.",
            error: err.message
          });
        }
        // Pass other multer errors to the global error handler
        return next(err);
      } else if (err) {
        // Pass other errors to the global error handler
        return next(err);
      }

      req.uploadedFiles = {};

      fields.forEach((field) => {
        const files = req.files?.[field.name];
        if (files && files.length > 0) {
          req.uploadedFiles[field.name] =
            field.maxCount === 1
              ? files[0]._customRelativePath
              : files.map((f) => f._customRelativePath);
        }
      });

      next();
    });
  };
}

module.exports = dynamicUpload;