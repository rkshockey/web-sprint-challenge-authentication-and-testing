const router = require('express').Router();
const bcrypt = require('bcryptjs');
const validateUser = require('../middleware/validateUser');
const userUnique = require('../middleware/userUnique');
const userExists = require('../middleware/userExists')
const User = require('./auth-model')
const tokenMaker = require('./token-maker')

router.post('/register', validateUser, userUnique, async (req, res, next) => {
  const {username, password} = req.body;
  const hash = bcrypt.hashSync(password, 8)
  const user = await User.add({ username, password: hash })
  res.status(201).json(user)
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
});

router.post('/login', validateUser, userExists, (req, res, next) => {
  const { password } = req.body
  if(bcrypt.compareSync(password, req.user.password)){
    const token = tokenMaker(req.user)
    res.status(200).json({ message: `welcome, ${req.user.username}`, token })
  }else{
    next({ status: 401, message: 'invalid credentials' })
  }
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
});

module.exports = router;
