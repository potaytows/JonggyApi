var express = require('express');
var router = express.Router();
var UserModel = require('../models/users')
var RestaurantModel = require('../models/restaurants');

/* GET home page. */
router.get('/', async function (req, res, next) {
    try {
        const restaurants = await RestaurantModel.find();
        res.json(restaurants)

    } catch (error) {
        res.send(error)
    }


});

router.get('/:id', async function (req, res, next) {
    try {
        const restaurants = await RestaurantModel.findById(req.params.id);
        res.json(restaurants)

    } catch (error) {
        res.send(error)
    }


});
router.get('/getByUsername/:id', async function (req, res, next) {
    try {
        const restaurants = await RestaurantModel.findOne({owner:req.params.id});
        res.json(restaurants)

    } catch (error) {
        res.send(error)
    }


});



router.post('/addRestaurant', async function (req, res, next) {
    try {
        const newRestaurant = new RestaurantModel(req.body)
        const result = await newRestaurant.save();

        res.send({ "status": "added", "object": result })
    } catch (error) {
        res.send(error)
    }

});
router.delete('/delete/:id', async function (req, res, next) {
    try {
        const result = await RestaurantModel.findOneAndDelete({_id:req.params.id});
        res.send({ "status": "deleted", "object": result })

    } catch (error) {
        res.send(error)

    }

});
router.put('/edit/:id', async function (req, res, next) {
    try{
    const restaurant = await RestaurantModel.findById(req.params.id);
    if(restaurant.owner){
        console.log("called old owner")
        
        const oldOwner = await UserModel.findOneAndUpdate({ username:restaurant.owner }, {
            $set: {role:"normal user"}
          }, { new: true });
        const result = await RestaurantModel.findByIdAndUpdate({ _id: req.params.id },{
            $set:req.body   
        },{new:true});
    
        const usereresult = await UserModel.findOneAndUpdate({ username: req.body.owner }, {
            $set: {role:"owner"}
          }, { new: true });
          console.log(oldOwner)
        res.send({ "status": "edited", "object": result })

    }if(!restaurant.owner){
        console.log("called no owner")
        const result = await RestaurantModel.findByIdAndUpdate({ _id: req.params.id },{
            $set:req.body   
        },{new:true});
    
        const usereresult = await UserModel.findOneAndUpdate({ username: req.body.owner }, {
            $set: {role:"owner"}
          }, { new: true });
        console.log(result)
        res.send({ "status": "edited", "object": result })

    }
    
    }catch(error){
        console.log(error)
        res.send(error)
    }
});
module.exports = router;
