var express = require('express');
var router = express.Router();
var TableModel = require('../models/tables')
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
    const result = await RestaurantModel.findByIdAndUpdate({ _id: req.params.id },{
        $set:req.body
    },{new:true});
    res.send({ "status": "edited", "object": result })
    }catch(error){
        res.send(error)
    }
});
module.exports = router;
