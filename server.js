// ================= LOAD ENV =================
require("dotenv").config()

// ================= IMPORTS =================
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("./utils/cloudinary") // ONLY ONCE HERE

// ================= APP =================
const app = express()

// ================= MIDDLEWARE =================
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://student-portal-frontend-mu.vercel.app",
    "https://student-portal-frontend.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}))

app.options("*", cors())
app.use(express.json({limit: "30mb"}))

console.log("🔥 server.js loaded")

// ================= MONGO CONNECT =================
console.log("MONGO_URI =", process.env.MONGO_URI)

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Mongo connected"))
  .catch(err => console.log("❌ Mongo error", err))

// ================= MODELS =================
const Student = mongoose.model(
  "Student",
  new mongoose.Schema({
    regNo: String,
    name: String,
    className: String,
    password: String
  })
)

const Attendance = mongoose.model(
  "Attendance",
  new mongoose.Schema({
    regNo: String,
    className: String,
    status: String,
    date: String
  })
)

const Fees = mongoose.model(
  "Fees",
  new mongoose.Schema({
    regNo: String,
    className: String,
    totalFees: Number,
    paidAmount: { type: Number, default: 0 },
    balance: Number,
    status: String
  })
)

const Event = mongoose.model(
  "Event",
  new mongoose.Schema({
    title: String,
    description: String,
    date: String,
    className: String
  })
)

const Mark = mongoose.model(
  "Mark",
  new mongoose.Schema({
    regNo: String,
    name: String,
    className: String,
    subject: String,
    examType: String,
    internal: Number,
    exam: Number,
    total: Number
  })
)

// File Model
const fileSchema = new mongoose.Schema({
  title: String,
  className: String,
  fileUrl: String,
  originalName: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
})
const File = mongoose.model("File", fileSchema)

// ================= CLOUDINARY STORAGE =================
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "student-portal",
    allowed_formats: ["jpg", "png", "pdf"]
  }
})

const upload = multer({ storage })

// ================= TEST =================
app.get("/ping", (req, res) => {
  console.log("Ping hit")
  res.send("PONG")
})

// ================= LOGIN =================
app.post("/login", async (req, res) => {
  const { username, password } = req.body

  // ADMIN
  if (username === "admin" && password === "admin123") {
    return res.json({ success: true, role: "admin" })
  }

  // STUDENT
  const student = await Student.findOne({
    regNo: username,
    password
  })

  if (!student) {
    return res.json({ success: false })
  }

  res.json({
    success: true,
    role: "student",
    regNo: student.regNo,
    className: student.className,
    name: student.name
  })
})

// ================= CLASSES =================
app.get("/classes", async (req, res) => {
  const classes = await Student.distinct("className")
  res.json(classes)
})

// ================= STUDENTS BY CLASS =================
app.get("/students", async (req, res) => {
  const { className } = req.query

  let students = []

  if (!className || className === "ALL") {
    students = await Student.find()
  } else {
    students = await Student.find({ className })
  }

  res.json(students)
})

// ================= ATTENDANCE =================
app.post("/attendance", async (req, res) => {
  await Attendance.insertMany(req.body)
  res.json({ success: true })
})

app.get("/attendance/student", async (req, res) => {
  const { regNo } = req.query
  const records = await Attendance.find({ regNo })
  res.json(records)
})

// ================= FEES =================
app.post("/fees/class", async (req, res) => {
  const { className, totalFees } = req.body

  if (!className || !totalFees) {
    return res.json({ success: false })
  }

  const students = await Student.find({ className })

  for (const stu of students) {
    let fees = await Fees.findOne({ regNo: stu.regNo })

    if (!fees) {
      fees = new Fees({
        regNo: stu.regNo,
        className,
        totalFees,
        paidAmount: 0,
        balance: totalFees,
        status: "PENDING"
      })
    } else {
      fees.totalFees = totalFees
      fees.balance = totalFees - fees.paidAmount
      fees.status = fees.balance <= 0 ? "PAID" : "PARTIAL"
    }

    await fees.save()
  }

  res.json({ success: true })
})

app.post("/fees/pay", async (req, res) => {
  const { regNo, className, amount } = req.body

  if (!regNo || !amount) {
    return res.json({ success: false })
  }

  let fees = await Fees.findOne({ regNo })

  if (!fees) {
    fees = new Fees({
      regNo,
      className,
      totalFees: 0,
      paidAmount: amount,
      balance: 0,
      status: "PAID"
    })
  } else {
    fees.paidAmount += amount
    fees.balance = fees.totalFees - fees.paidAmount
    fees.status = fees.balance <= 0 ? "PAID" : "PARTIAL"
  }

  await fees.save()
  res.json({ success: true })
})

app.get("/fees/student", async (req, res) => {
  const { regNo } = req.query
  const fees = await Fees.findOne({ regNo })
  res.json(fees || null)
})

// ================= EVENTS =================
app.post("/events", async (req, res) => {
  const { title, description, date, className } = req.body

  if (!title || !description || !date || !className) {
    return res.json({ success: false })
  }

  await Event.create({ title, description, date, className })
  res.json({ success: true })
})

app.get("/events", async (req, res) => {
  const { className } = req.query
  let events = []

  if (className === "ALL") {
    events = await Event.find()
  } else {
    events = await Event.find({
      $or: [{ className }, { className: "ALL" }]
    })
  }

  res.json(events)
})

// ================= FILE UPLOAD =================
// app.post("/files/upload", upload.single("file"), async (req, res) => {
//   try {
//     const newFile = new File({
//       title: req.body.title,
//       className: req.body.className,
//       fileUrl: req.file.path,
//       originalName: req.file.originalname
//     })

//     await newFile.save()
//     res.json({ success: true })
//   } catch (err) {
//     console.error("Upload error:", err)
//     res.status(500).json({ success: false, error: err.message })
//   }
// })
// ================= FILE UPLOAD =================
// ================= FILE UPLOAD =================
app.post("/files/upload", upload.single("file"), async (req, res) => {
  try {
    console.log("📤 File upload request received")
    console.log("📁 File:", req.file ? "Present" : "Missing")
    console.log("📝 Title:", req.body.title)
    console.log("📝 Class:", req.body.className)

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: "No file uploaded" 
      })
    }

    // Check required fields
    if (!req.body.title || !req.body.className) {
      return res.status(400).json({ 
        success: false, 
        error: "Title and className are required" 
      })
    }

    console.log("🔗 Cloudinary URL:", req.file.path)
    console.log("📄 Original name:", req.file.originalname)

    // Create file record
    const newFile = new File({
      title: req.body.title,
      className: req.body.className,
      fileUrl: req.file.path,
      originalName: req.file.originalname
    })

    // Save to database
    await newFile.save()
    
    console.log("✅ File saved to database with ID:", newFile._id)
    
    res.json({ 
      success: true, 
      message: "File uploaded successfully",
      file: {
        id: newFile._id,
        title: newFile.title,
        url: newFile.fileUrl,
        className: newFile.className
      }
    })
    
  } catch (err) {
    console.error("❌ UPLOAD ERROR DETAILS:")
    console.error("Error message:", err.message)
    console.error("Error stack:", err.stack)
    
    res.status(500).json({ 
      success: false, 
      error: "Internal server error",
      details: err.message 
    })
  }
})
// ================= STUDENT FILES =================
app.get("/files/student", async (req, res) => {
  const { regNo } = req.query

  if (regNo === "ADMIN") {
    return res.json(await File.find())
  }

  const student = await Student.findOne({ regNo })
  if (!student) return res.json([])

  const files = await File.find({
    $or: [
      { className: student.className },
      { className: "ALL" }
    ]
  })

  res.json(files)
})

// ================= STUDENT REPORT =================
app.get("/student/report", async (req, res) => {
  const { regNo } = req.query

  const student = await Student.findOne({ regNo })
  if (!student) return res.json(null)

  const attendanceRecords = await Attendance.find({ regNo })
  const totalDays = attendanceRecords.length
  const presentDays = attendanceRecords.filter(
    a => a.status === "present"
  ).length
  const percentage =
    totalDays === 0 ? 0 : Math.round((presentDays / totalDays) * 100)

  const marks = await Mark.find({ regNo })
  const fees = await Fees.findOne({ regNo })

  res.json({
    student,
    attendance: {
      totalDays,
      presentDays,
      percentage
    },
    marks,
    fees
  })
})

// ================= MARKS =================
app.post("/marks", async (req, res) => {
  const records = req.body

  for (const r of records) {
    const total = (r.internal || 0) + (r.exam || 0)

    await Mark.findOneAndUpdate(
      {
        regNo: r.regNo,
        subject: r.subject,
        examType: r.examType
      },
      {
        ...r,
        total
      },
      { upsert: true }
    )
  }

  res.json({ success: true })
})

app.get("/marks/student", async (req, res) => {
  const { regNo } = req.query
  const marks = await Mark.find({ regNo })
  res.json(marks)
})
// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR HANDLER:")
  console.error(err.stack)
  
  // If it's a multer error
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: `Multer error: ${err.message}`
    })
  }
  
  // Generic error
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message
  })
})

// ================= START =================
const PORT = process.env.PORT || 10000
app.listen(PORT, () =>
  console.log("🚀 Server running on port", PORT)
)