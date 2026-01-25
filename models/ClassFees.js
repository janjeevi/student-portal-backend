const mongoose = require("mongoose")

const classFeesSchema = new mongoose.Schema({
  className: { type: String, unique: true },
  totalFees: Number
})

module.exports = mongoose.model("ClassFees", classFeesSchema)
