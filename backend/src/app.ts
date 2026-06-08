import express from "express"
import cors from "cors"

import authRoute from "./routes/authRoute"

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.send("API funcionando")
})

app.use("/api/auth", authRoute)

export default app