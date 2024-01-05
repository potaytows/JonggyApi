var express = require('express');
var router = express.Router();
var UserModel = require('../models/users')
/* GET users listing. */

function contains(arr, key, val) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) return true;
  }
  return false;
}

router.get('/getusers', async function (req, res, next) {
  try {
    const result = await UserModel.find({}, { 'password': 0 })
    res.json(result)

  } catch (error) {
    res.send(error)
  }

});

router.get('/auth', async function (req, res, next) {
  try {
    const result = await UserModel.findOne({ 'email': req.body.email, 'password': req.body.password }, { 'password': 0 })
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
  try {
    const usedEmail = await UserModel.find({}, { 'email': 1, '_id': 0 })
    const usedUsername = await UserModel.find({}, { 'username': 1, '_id': 0 })
    if (!contains(usedEmail, "email", req.body.email) && !contains(usedUsername, "username", req.body.username)) {
      const newuser = await new UserModel(req.body)
      const result = await newuser.save();
      res.json({ "status": "added", "obj": result });

    } else {
      res.json({ "error": 'this email or username is already taken!!' })
    }

  } catch (error) {
    res.send(error)
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
