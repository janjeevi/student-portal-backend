const mongoose = require("mongoose")

const marksSchema = new mongoose.Schema({
  regNo: String,
  name: String,
  className: String,
  subject: String,
  examType: String,
  internal: Number,
  exam: Number,
  total: Number,
  date: String
})

module.exports = mongoose.model("Marks", marksSchema)
