const { findBy } = require('../auth/auth-model');

async function userUnique (req, res, next) {
    const {username} = req.body;
    const [user] = await findBy({username})
    if (user) {
        next({ status: 400, message: 'username taken' })
    }else{
        next();
    }
}

module.exports = userUnique
