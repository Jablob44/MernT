const express = require("express");
const router = express.Router();
const keys = require('../../config/keys');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);
  
    if (!isValid) {
      return res.status(400).json(errors);
    }
  
    User.findOne({ email: req.body.email })
      .then(user => {
        if (user) {
          // Use the validations to send the error
          errors.email = 'Email already exists';
          return res.status(400).json(errors);
        } else {
          const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
          })
        }
      })
  })

  router.post('/login', (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);
  
    if (!isValid) {
      return res.status(400).json(errors);
    }
  
    const email = req.body.email;
    const password = req.body.password;
  
    User.findOne({email})
      .then(user => {
        if (!user) {
          // Use the validations to send the error
          errors.email = 'User not found';
          return res.status(404).json(errors);
        }
  
        bcrypt.compare(password, user.password)
          .then(isMatch => {
            if (isMatch) {
              res.json({msg: 'Success'});
            } else {
              // And here:
              errors.password = 'Incorrect password'
              return res.status(400).json(errors);
            }
          })
      })
  })

router.get("/test", (req, res) => res.json({ msg: "This is the users route" }));
// users.js
router.post("/register", (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);
  
    if (!isValid) {
      return res.status(400).json(errors);
    }
  
    User.findOne({ handle: req.body.handle }).then(user => {
      if (user) {
        errors.handle = "User already exists";
        return res.status(400).json(errors);
      } else {
        const newUser = new User({
          handle: req.body.handle,
          email: req.body.email,
          password: req.body.password
        });
  
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                const payload = { id: user.id, handle: user.handle };
  
                jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
                  res.json({
                    success: true,
                    token: "Bearer " + token
                  });
                });
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  });
// users.js
router.post("/login", (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);
  
    if (!isValid) {
      return res.status(400).json(errors);
    }
  
    const handle = req.body.handle;
    const password = req.body.password;
  
    User.findOne({ handle }).then(user => {
      if (!user) {
        errors.handle = "This user does not exist";
        return res.status(400).json(errors);
      }
  
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          const payload = { id: user.id, handle: user.handle };
  
          jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          });
        } else {
          errors.password = "Incorrect password";
          return res.status(400).json(errors);
        }
      });
    });
  });
  // users.js
// bcrypt.compare(password, user.password)
// .then(isMatch => {
//   if (isMatch) {
//     const payload = {id: user.id, handle: user.handle};

//     jwt.sign(
//       payload,
//       keys.secretOrKey,
//       // Tell the key to expire in one hour
//       {expiresIn: 3600},
//       (err, token) => {
//         res.json({
//           success: true,
//           token: 'Bearer ' + token
//         });
//       });
//   } else {
//     return res.status(400).json({password: 'Incorrect password'});
//   }
// })
  module.exports = {
    mongoURI: 'mongodb+srv://jablob44:sorrybutno@cluster0.w9ibc.mongodb.net/?retryWrites=true&w=majority',
    secretOrKey: 'secret'
  }
module.exports = router;