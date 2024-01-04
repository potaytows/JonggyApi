var express = require('express');
var router = express.Router();
var Usersmodel = require('../models/users')

/* GET home page. */
router.get('/', async function (req, res, next) {
    try {
        const user = await Usersmodel.find();
        res.json(user)

    } catch (error) {
        res.send(error)
    }


});

router.post('/addUser', async function (req, res, next) {
    try {
        const newUser = new Usersmodel(req.body)
        const result = await newUser.save();

        res.send({ "status": "added", "object": result })
    } catch (error) {
        res.send(error)
    }

});
// router.delete('/delete/:id', async function (req, res, next) {
//     try {
//         const result = await Usersmodel.findOneAndDelete({_id:req.params.id});
//         res.send({ "status": "deleted", "object": result })

//     } catch (error) {
//         res.send(error)

//     }

// });
// router.put('/edit/:id', async function (req, res, next) {
//     try{
//     const result = await Usersmodel.findByIdAndUpdate({ _id: req.params.id },{
//         $set:req.body
//     },{new:true});
//     res.send({ "status": "edited", "object": result })
//     }catch(error){
//         res.send(error)
//     }
// });
module.exports = router;

