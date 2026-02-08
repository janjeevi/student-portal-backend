const express = require("express");
const upload = require("../middleware/upload");
const File = require("../models/File");

const router = express.Router();

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { title, className } = req.body;

    const file = new File({
      title,
      className,
      fileUrl: req.file.path, // 🔥 CLOUDINARY URL
    });

    await file.save();

    res.json({ success: true, file });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;