const express = require('express');
const router = express.Router();
const UserModel = require('../models/users');

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

router.post('/auth', async function (req, res, next) {
  try {
    const result = await UserModel.findOne({ 'username': req.body.username, 'password': req.body.password }, { 'password': 0 })
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

router.post('/auth', async function(req, res, next) {
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
