// utils/cloudinary.js
const cloudinary = require("cloudinary").v2

// Log environment variables (mask secrets)
console.log("🔧 Cloudinary Configuration:")
console.log("   Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME || "❌ NOT SET")
console.log("   API Key:", process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ NOT SET")
console.log("   API Secret:", process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ NOT SET")

// Validate configuration
if (!process.env.CLOUDINARY_CLOUD_NAME || 
    !process.env.CLOUDINARY_API_KEY || 
    !process.env.CLOUDINARY_API_SECRET) {
  console.error("❌ Cloudinary environment variables are missing!")
  console.error("   Please check your .env file")
} else {
  console.log("✅ Cloudinary environment variables are set")
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

module.exports = cloudinary