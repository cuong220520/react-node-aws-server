const express = require('express')
const router = express.Router()

// import from controllers
const { register, registerActivate, login } = require('../controllers/auth')
const { runValidation } = require('../validators')
const { userRegisterValidator, userLoginValidator } = require('../validators/auth')

router.post('/register', userRegisterValidator, runValidation, register)
router.post('/login', userLoginValidator, runValidation, login)
router.post('/register/activate', registerActivate)

module.exports = router
