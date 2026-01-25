const mongoose = require("mongoose")

const fileSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  className: {
    type: String, // "3rd STD" or "ALL"
    required: true
  },

  fileUrl: {
    type: String, // "/uploads/xyz.pdf"
    required: true
  },

  uploadedAt: {
    type: String,
    default: () => new Date().toISOString().slice(0, 10)
  }
})

module.exports = mongoose.model("File", fileSchema)
