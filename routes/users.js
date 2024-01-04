const express = require('express');
const router = express.Router();
const UserModel = require('../models/users');

function contains(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) return true;
  }
  return false;
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // ตรวจสอบการล็อกอินในฐานข้อมูลของคุณ
    const user = await UserModel.findOne({ username, password });

    if (user) {
      res.status(200).json({ message: 'เข้าสู่ระบบสำเร็จ' });
    } else {
      res.status(401).json({ message: 'ล็อกอินไม่สำเร็จ' });
    }
  } catch (error) {
    res.status(500).json({ error: 'มีข้อผิดพลาดในการตรวจสอบการล็อกอิน' });
  }
});


router.get('/getusers', async function(req, res, next) {
  try {
    const result = await UserModel.find({}, { 'password': 0 });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching users' });
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

router.post('/addUser', async function(req, res, next) {
  const usedEmail = await UserModel.find({}, { 'email': 1, '_id': 0 });
  if (!contains(usedEmail, "email", req.body.email)) {
    const newuser = new UserModel(req.body);
    try {
      const result = await newuser.save();
      res.json({ "status": "added", "obj": result });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while adding user' });
    }
  } else {
    res.json({ "error": 'this email is taken' });
  }
});

router.put('/edit/:id', async function(req, res, next) {
  try {
    const result = await UserModel.findByIdAndUpdate({ _id: req.params.id }, {
      $set: req.body
    }, { new: true });
    res.send({ "status": "edited", "object": result });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while editing user' });
  }
});

module.exports = router;
