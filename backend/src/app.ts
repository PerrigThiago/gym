import express from "express"
import cors from "cors"

import administracionRoute from "./routes/administracionRoute"
import authRoute from "./routes/authRoute"
import planRoute from "./routes/planRoute"
import pagoRoute from "./routes/pagoRoute"
import reglaMensualRoute from "./routes/reglaMensualRoute"
import socioRoute from "./routes/socioRoute"

const app = express()
const allowedOrigins = process.env.FRONTEND_URL
  ?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: allowedOrigins?.length ? allowedOrigins : true,
  })
)
app.use(express.json())

app.get("/", (req, res) => {
  res.send("API funcionando")
})

app.use("/api/auth", authRoute)
app.use("/api/planes", planRoute)
app.use("/api/socios", socioRoute)
app.use("/api/pagos", pagoRoute)
app.use("/api/reglas-mensuales", reglaMensualRoute)
app.use("/api/administracion", administracionRoute)

export default app
