const bcrypt = require('bcryptjs')

const hash = bcrypt.hashSync('foobar', 8)

exports.seed = function(knex) {
  return knex('users').insert([
    { username: 'foo', password: hash },
    { username: 'bar', password: hash }
  ])
};
