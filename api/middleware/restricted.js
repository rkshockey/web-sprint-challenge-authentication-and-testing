const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../../env-connect')

module.exports = (req, res, next) => {
  const token = req.headers.authorization
  if (token){
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err){
        next({ status: 401, message: "token invalid" })
      }else{
        req.decodeUser = decoded
        next()
      }
    })
  }else{
    next({ status: 401, message: "token required" })
  }
};
