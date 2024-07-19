const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;

  // Input validation
  if (!email || !name || !password) {
    console.log('Form submission is incorrect');
    return res.status(400).json('incorrect form submission');
  }

  console.log('Password to hash:', password);
  const hash = bcrypt.hashSync(password);
  console.log('Hashed password:', hash);

  db.transaction(trx => {
    trx('login')
      .insert({
        hash: hash,
        email: email
      })
      .returning('email')
      .then(loginEmail => {
        console.log('Login email:', loginEmail[0].email);
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0].email,
            name: name,
            joined: new Date()
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  })
  .then(user => {
    console.log('User registered:', user[0]);
    res.json(user[0]);
  })
  .catch(err => {
    console.log('Database error:', err);
    res.status(400).json('unable to register');
  });
}
module.exports = {
  handleRegister: handleRegister
};
