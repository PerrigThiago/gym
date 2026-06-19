import express from "express"
import cors from "cors"

import administracionRoute from "./routes/administracionRoute"
import authRoute from "./routes/authRoute"
import planRoute from "./routes/planRoute"
import pagoRoute from "./routes/pagoRoute"
import reglaMensualRoute from "./routes/reglaMensualRoute"
import socioRoute from "./routes/socioRoute"

const app = express()
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URLS,
]
  .filter(Boolean)
  .flatMap((value) => value!.split(","))
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean)

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true)
    }

    const normalizedOrigin = origin.replace(/\/$/, "")

    if (!allowedOrigins.length || allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true)
    }

    return callback(new Error(`Origen no permitido por CORS: ${origin}`))
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}

/*
  FRONTEND_URL debe configurarse en produccion, por ejemplo:
  FRONTEND_URL=https://gym-zeta-ruddy.vercel.app
*/
app.use(cors(corsOptions))
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
