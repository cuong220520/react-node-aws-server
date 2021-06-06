const  mongoose = require('mongoose')
const { Schema } = mongoose
const crypto = require('crypto')

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    max: 12,
    unique: true,
    lowercase: true,
  },
  name: {
    type: String,
    trim: true,
    required: true,
    max: 32,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    lowercase: true,
  },
  hashed_password: {
    type: String,
    required: true,
  },
  salt: String,
  role: {
    type: String,
    default: 'subcriber',
  },
  reset_password_link: {
    data: String,
    default: '',
  },
}, { timestamps: true })

// virtual field
userSchema.virtual('password')
  .set(function(password) {
    // temp var called _password
    this._password = password
    // gen salt
    this.salt = this.makeSalt()
    // encrypt password
    this.hashed_password = this.encryptPassword(password)
  })
  .get(function() {
    return this._password
  })
// encrypt password, make salt
userSchema.methods = {
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashed_password
  },

  encryptPassword: function(password) {
    if (!password) return ''
    try {
      return crypto
      .createHmac('sha256', this.salt)
      .update(password)
      .digest('hex')

    } catch (err) {
      return ''
    }
  },

  makeSalt: function() {
    return Math.round(new Date().valueOf() * Math.random()) + ''
  }
}
// export user model
module.exports = mongoose.model('User', userSchema)