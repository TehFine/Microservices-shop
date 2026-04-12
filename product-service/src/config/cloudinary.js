const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cấu hình storage — lưu ảnh vào folder products
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "microservices-shop/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      {
        width: 800,
        height: 800,
        crop: "limit",
        quality: "auto",
      },
    ],
  },
});

// Cấu hình multer
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Tối đa 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Chi chap nhan file anh JPG, PNG, WEBP"), false);
    }
  },
});

module.exports = { cloudinary, upload };