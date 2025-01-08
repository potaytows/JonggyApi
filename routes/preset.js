var express = require('express');
var router = express.Router();
const PresetModel = require('../models/preset');
const RestaurantModel = require('../models/restaurants');



router.get('/getpresetByRestaurantid/:id', async function (req, res, next) {
    try {

        const result = await PresetModel.find({ _id: req.params.id })

        console.log(result)
        res.send(result)
    } catch (error) {
        res.status(400).send(error)
        console.log(error)
    }
});

router.delete('/delete/:id', async function (req, res, next) {
    try {

        const result = await PresetModel.findOneAndDelete({ _id: req.params.id })
        console.log(result)
        res.send(result)
    } catch (error) {
        res.status(400).send(error)
        console.log(error)
    }
});
router.post('/addpreset/:id', async function (req, res, next) {
    console.log(req.body)
    try {
        const newPreset = new PresetModel(req.body);
        newPreset.restaurant_id = req.params.id;
        newPreset.save()
        const checkPreset = await RestaurantModel.findOne({ _id: req.params.id });
        if (checkPreset.activePreset == null || checkPreset.activePreset == "" || checkPreset == undefined) {
            checkPreset.activePreset = newPreset.id
            checkPreset.save();
        }
        res.send({ status: "success", obj: newPreset })
    } catch (error) {
        res.status(400).send(error)
        console.log(error)
    }
});

router.get('/setpreset/:restaurantid/:presetid', async function (req, res, next) {
    try {
        const restaurant = await RestaurantModel.findOne({ _id: req.params.restaurantid });
        const preset = await PresetModel.findOne({ _id: req.params.presetid });
        restaurant.activePreset = req.params.presetid;
        restaurant.save()
        res.send({ status: "success", restaurant: restaurant, preset: preset })
    } catch (error) {
        res.status(400).send(error)
        console.log(error)
    }
});
router.put('/edit/:id', async function (req, res, next) {
    try {
        const restaurant = await RestaurantModel.findOne({_id:req.params.id})
        const result = await PresetModel.findByIdAndUpdate({ _id: restaurant.activePreset }, {
            $set: req.body
        }, { new: true });
        res.send({ "status": "edited", "object": result })
        console.log(result);
    } catch (error) {
        res.send(error)
    }
});

module.exports = router;
