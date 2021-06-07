const AWS = require('aws-sdk')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { registerEmailParams } = require('../helpers/email')
const { v4: uuidv4 } = require('uuid')
const expressJwt = require('express-jwt')

AWS.config.update({
  accessKeyId: process.env.AWS_KEY_ID,
  secretAccessKey: process.env.AWS_KEY_SECRET,
  region: process.env.AWS_REGION,
})

const ses = new AWS.SES({ apiVersion: '2010-12-01' })

exports.register = (req, res) => {
  // console.log('REGISTER CONTROLLER', req.body)

  const { name, email, password } = req.body

  User.findOne({ email: email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({ error: 'Email is taken' })
    }
  })

  // generate token with username email and password
  const token = jwt.sign(
    { name, email, password },
    process.env.JWT_ACCOUNT_ACTIVATION,
    {
      expiresIn: '10m',
    }
  )

  const params = registerEmailParams(email, token)

  const sendEmailRegistration = ses.sendEmail(params).promise()

  sendEmailRegistration
    .then((data) => {
      console.log('Email submitted to SES', data)
      res.json({
        message: `Email has been sent to ${email}, follow the instructions to complete your registration`,
      })
    })
    .catch((err) => {
      console.error(err)
      res.status(400).json({
        error: `We could not verify your email, please try again`,
      })
    })
}

exports.registerActivate = (req, res) => {
  const { token } = req.body
  console.log(token)
  jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        error: 'Expired link, try again',
      })
    }

    const { name, email, password } = jwt.decode(token)
    const username = uuidv4()

    User.find({ email }).exec((err, users) => {
      if (users.length > 0) {
        return res.status(401).json({
          error: 'Email is taken',
        })
      }

      // register new user
      const newUser = new User({ username, name, email, password })
      newUser.save((err, result) => {
        if (err) {
          return res.status(401).json({
            error: 'Error saving user in database, try later',
          })
        }

        return res.json({
          message: 'Registration successful. Please login',
        })
      })
    })
  })
}

exports.login = (req, res) => {
  const { email, password } = req.body

  // console.log(email, password)

  User.findOne({ email }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User with that email does not exist. Please register',
      })
    }

    // authenticate
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: 'Email and password do not match',
      })
    }

    // user.authenticate(password, (err, result) => {
    //   if (err || !result) {
    //     return res.status(401).json({
    //       error: 'Email and password do not match',
    //     })
    //   }
    // })

    // generate token and send to client
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    })

    const { _id, name, email, role } = user

    return res.json({
      token,
      user: { _id, name, email, role },
    })
  })
}

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
})

exports.authMiddleware = (req, res, next) => {
  const authUserId = req.user._id
  User.findOne({ _id: authUserId }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'User not found' })
    }

    req.profile = user
    next()
  })
}

exports.adminMiddleware = (req, res, next) => {
  const adminUserId = req.user._id
  User.findOne({ _id: adminUserId }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'User not found' })
    }

    // check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin resource. Access denied' })
    }

    req.profile = user
    next()
  })
}
