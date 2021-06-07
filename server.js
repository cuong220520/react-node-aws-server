const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const connectDb = require('./config/db')
require('dotenv').config()

const app = express()

// config cors allowed domain
const corsOpts = {
  origin: process.env.CLIENT_DOMAIN,
  optionsSuccessStatus: 200,
}

// db
connectDb(process.env.DATABASE_URI)

// import routes
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')

// app middlewares
// morgan for logging in dev env
app.use(morgan('dev'))
app.use(express.json())
// avoid sharing data between different domain (dev)
app.use(cors(corsOpts))

// routes
app.use('/api/auth', authRoutes)
app.use('/api/profile', userRoutes)

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`Server is running on ${port}`)
})
