const { findBy } = require('../auth/auth-model')

module.exports = async function (req, res, next) {
    const [user] = await findBy({ username: req.body.username })
    if (user){
        req.user = user
        next()
    }else{
        next({ status: 401, message: 'invalid credentials' })
    }
}