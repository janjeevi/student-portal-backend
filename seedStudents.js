require("dotenv").config()

const mongoose = require("mongoose")

mongoose.connect(process.env.MONGO_URI)

  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log(err))

const studentSchema = new mongoose.Schema({
  regNo: String,
  name: String,
  className: String,
  password: String
})

const Student = mongoose.model("Student", studentSchema)

const classes = ["1", "2", "3", "4", "5"]
const sections = ["A", "B"]

async function seedStudents() {
  await Student.deleteMany({})
  console.log("🗑️ Old students deleted")

  const students = []

  classes.forEach(cls => {
    sections.forEach(sec => {
      for (let i = 1; i <= 10; i++) {
        const roll = i.toString().padStart(2, "0")
        const regNo = `${cls.padStart(2, "0")}${sec}${roll}`

        students.push({
          regNo,
          name: `Student ${regNo}`,
          className: `${cls}-${sec}`,
          password: "student123"
        })
      }
    })
  })

  await Student.insertMany(students)
  console.log("✅ Students seeded successfully")

  mongoose.disconnect()
}

seedStudents()
