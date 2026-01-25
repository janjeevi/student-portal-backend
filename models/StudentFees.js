const mongoose = require("mongoose")

const studentFeesSchema = new mongoose.Schema({
  regNo: String,
  className: String,
  paidAmount: { type: Number, default: 0 },
  balance: Number,
  status: { type: String, default: "PENDING" }
})

module.exports = mongoose.model("StudentFees", studentFeesSchema)
