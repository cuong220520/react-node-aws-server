const AWS = require('aws-sdk')

AWS.config.update({
  accessKeyId: process.env.AWS_KEY_ID,
  secretAccessKey: process.env.AWS_KEY_SECRET,
  region: process.env.AWS_REGION,
})

const ses = new AWS.SES({ apiVersion: '2010-12-01' })

exports.register = (req, res) => {
  // console.log('REGISTER CONTROLLER', req.body)

  const { name, email, password } = req.body
  const params = {
    Source: process.env.EMAIL_FROM,
    Destination: {
      ToAddresses: [email],
    },
    ReplyToAddresses: [process.env.EMAIL_TO],
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `<html><body><h1>Hello ${name}</h1><p>Test email</p></body></html>`,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Complete your registration',
      },
    },
  }

  const sendEmailRegistration = ses.sendEmail(params).promise()

  sendEmailRegistration
    .then((data) => {
      console.log('Email submitted to SES', data)
      res.send('Email sent successfully')
    })
    .catch((err) => {
      console.error(err)
      res.send('Email sent failed')
    })
}
