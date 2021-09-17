const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../../env-connect')

module.exports = function (user) {
    const payload = {
        subject: user.id,
        username: user.username
    }
    const options = {
        expiresIn: '1d'
    }

    return jwt.sign(payload, JWT_SECRET, options)
}
