import express from "express"
import cors from "cors"

import authRoute from "./routes/authRoute"
import planRoute from "./routes/planRoute"
import pagoRoute from "./routes/pagoRoute"
import reglaMensualRoute from "./routes/reglaMensualRoute"
import socioRoute from "./routes/socioRoute"

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.send("API funcionando")
})

app.use("/api/auth", authRoute)
app.use("/api/planes", planRoute)
app.use("/api/socios", socioRoute)
app.use("/api/pagos", pagoRoute)
app.use("/api/reglas-mensuales", reglaMensualRoute)

export default app
