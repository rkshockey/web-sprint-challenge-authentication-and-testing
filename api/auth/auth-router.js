const router = require('express').Router();
const bcrypt = require('bcryptjs');
const validateUser = require('../middleware/validateUser');
const userUnique = require('../middleware/userUnique');
const userExists = require('../middleware/userExists')
const User = require('./auth-model')
const tokenMaker = require('./token-maker')

router.post('/register', validateUser, userUnique, async (req, res, next) => {
  try {
    const {username, password} = req.body;
    const hash = bcrypt.hashSync(password, 8)
    const user = await User.add({ username, password: hash })
    res.status(201).json(user)
  } catch (err) {
    next(err)
  }
});

router.post('/login', validateUser, userExists, (req, res, next) => {
  const { password } = req.body
  if(bcrypt.compareSync(password, req.user.password)){
    const token = tokenMaker(req.user)
    res.status(200).json({ message: `welcome, ${req.user.username}`, token })
  }else{
    next({ status: 401, message: 'invalid credentials' })
  }
});

module.exports = router;
