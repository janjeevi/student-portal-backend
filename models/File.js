const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  title: String,
  className: String,
  fileUrl: String,
});

module.exports = mongoose.model("File", fileSchema);


