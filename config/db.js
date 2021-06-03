const mongoose = require('mongoose')

const connectDb = async (url) => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })

    console.log('DB connected')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

module.exports = connectDb
