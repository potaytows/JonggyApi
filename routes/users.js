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

router.get('/getusers', async function(req, res, next) {
  const result = await UserModel.findOne({}, { 'password': 0 })
  res.json(result)
});
router.get('/auth', async function(req, res, next) {
  const result = await UserModel.findOne({ 'email': req.body.email, 'password': req.body.password }, { 'password': 0 })
  if(result){
    res.json({"status":"auth success","obj":result})

  }else[
    res.json({"status":"auth failed"})
  ]
  
});

router.post('/addUser',async function(req,res,next){
  const usedEmail = await UserModel.find({},{'email':1,'_id':0})
  if(!contains(usedEmail, "email", req.body.email)){
    const newuser = await new UserModel(req.body)
    const result = await newuser.save();
    res.json({"status":"added","obj":result});

  }else{
    res.json({"error":'this email is taken'})
  }
});


router.put('/edit/:id',async function(req,res,next){
  try{
    const result = await UserModel.findByIdAndUpdate({ _id: req.params.id },{
        $set:req.body
    },{new:true});
    res.send({ "status": "edited", "object": result })
    }catch(error){
        res.send(error)
    }
})

module.exports = router;
