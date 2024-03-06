const express = require('express');
const router = express.Router();
const UserModel = require('../models/users');
const bcrypt = require('bcrypt');
const saltRounds = 10;
function contains(arr, key, val) {

  for (var i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) return true;
  }
  return false;
}


router.get('/getusers', async function (req, res, next) {
  try {
    const result = await UserModel.find({ role: "normal user" }, { 'password': 0 })
    res.json(result)
  } catch (error) {
    res.send(error)
  }

});

router.get('/getusers/:id', async function (req, res, next) {
  try {
    const result = await UserModel.findOne({ role: "normal user", username_lower: req.params.id.toLowerCase() }, { 'password': 0 }).limit(50)
    res.json(result)

  } catch (error) {
    res.send(error)
  }

});
router.get('/getlikeUsers/:id', async function (req, res, next) {
  try {
    const result = await UserModel.find({ role: "normal user", username: { $regex: new RegExp("^" + req.params.id.toLowerCase(), "i") } }, { 'password': 0 }).limit(50)
    res.json(result)

  } catch (error) {
    res.send(error)
  }

});

router.post('/auth', async function (req, res, next) {
  try {
    const result = await UserModel.findOne({ 'username': req.body.username })
    result.comparePassword(req.body.password, function (err, isMatch) {
      console.log(isMatch)
      if (err) throw err;
      if (isMatch) {
        res.json({ "status": "auth success", "obj": result })

      } else {
        res.json({ "status": "auth failed" })
      }
    });


  } catch (error) {
    res.send(error)
  }


});

router.post('/Auth/admin', async function (req, res, next) {
  try {
    const result = await UserModel.findOne({ 'username_lower': req.body.username.toLowerCase(), role: "admin" })
    if (result) {
      result.comparePassword(req.body.password, function (err, isMatch) {
        if (err) throw err;
        if (isMatch) {
          res.json({ "status": "auth success", "obj": result })

        } else {
          res.json({ "status": "auth failed" })
        }
      });

    } else {
      res.json({ "status": "auth failed" })
    }

  } catch (error) { 
    res.send(error)
  }


});

router.post('/Auth/owner', async function (req, res, next) {
  try {
    const result = await UserModel.findOne({ 'username': req.body.username, 'password': req.body.password, role: "owner" }, { 'password': 0 })
    if (result) {
      res.json({ "status": "auth success", "obj": result })

    } else {
      res.json({ "status": "auth failed" })
    }

  } catch (error) {
    res.send(error)
  }


});


router.post('/addUser', async function (req, res, next) {
  console.log(req.body)
  try {
    const usedEmail = await UserModel.find({}, { 'email': 1, '_id': 0 })
    const usedUsername = await UserModel.find({}, { 'username': 1, '_id': 0 })
    const lowerUsername = req.body.username.toLowerCase()
    if (!contains(usedEmail, "email", req.body.email) && !contains(usedUsername, "username_lower", lowerUsername)) {
      const newuser = new UserModel(req.body);
      newuser.username_lower = req.body.username.toLowerCase();
      const result = await newuser.save();
      console.log(result)
      res.json({ "status": "added", "obj": result });

    } else {
      res.json({ "error": 'this email or username is already taken!!' })
    }

  } catch (error) {

    console.log(error)
    res.send(error)
  }

});

router.post('/auth', async function (req, res, next) {
  const { email, password } = req.body;
  try {
    const result = await UserModel.findOne({ 'email': email, 'password': password }, { 'password': 0 });
    if (result) {
      res.json({ "status": "auth success", "obj": result });
    } else {
      res.json({ "status": "auth failed" });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during authentication' });
  }
});


router.put('/edit/:id', async function (req, res, next) {
  try {
    const result = await UserModel.findByIdAndUpdate({ _id: req.params.id }, {
      $set: req.body
    }, { new: true });

    res.send({ "status": "edited", "object": result })
  } catch (error) {
    res.send(error)
  }
})


module.exports = router;
