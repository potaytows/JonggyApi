var express = require('express');
var router = express.Router();
var TableModel = require('../models/tables');
var PresetModel = require('../models/preset');
var RestaurantModel = require('../models/restaurants');

/* GET home page. */
router.get('/', async function (req, res, next) {
    try {
        const tables = await TableModel.find();
        res.json(tables)
    } catch (error) {
        res.send(error)
    }

});

router.get('/:id', async function (req, res, next) {
    try {
        const result = await PresetModel.findOne({"tables._id": req.params.id });
        const tableindex = result.tables.findIndex((table)=> table._id.toString()===req.params.id);
        const table = result.tables[tableindex];
        console.log(table)
        res.json(table)
    } catch (error) {
        res.send(error)
        
    }
});
router.get('/getbyRestaurantId/:id', async function (req, res, next) {
    try {
        const id = req.params.id
        const presets = await PresetModel.find({ restaurant_id: id }, { updatedAt: 0, createdAt: 0 });
        const restaurant = await RestaurantModel.findOne({ _id: id }, { updatedAt: 0, createdAt: 0,restaurantIcon:0}).populate("activePreset");
        if(restaurant.activePreset == null || restaurant.activePreset == ""||restaurant == undefined){
            restaurant.activePreset = presets[0].id
            restaurant.save();
        }
        res.json({presets:presets,activePreset:restaurant.activePreset})
    } catch (error) {
        res.send(error)
    }
});
router.get('/changestatus/:id', async function (req, res, next) {
    try {
        const result = await PresetModel.findOne({"tables._id": req.params.id });
        const tableindex = result.tables.findIndex((table)=> table._id.toString()===req.params.id);
        const table = result.tables[tableindex];
        console.log(table)
        if(table.status === "enabled"){
            table.status = "disabled";
            result.save();
            res.json(table);
            
        }else if (table.status === "disabled"){
            table.status = "enabled";
            result.save();
            res.json(table);
        }
    } catch (error) {
        res.send(error)
        console.log(error)
    }
});


router.post('/addTable', async function (req, res, next) {
    try {
        const restaurant = await RestaurantModel.findOne({_id:req.body.restaurant_id},{restaurantIcon:0});
        const preset = await PresetModel.findOne({_id:restaurant.activePreset});
        const newtable = await new TableModel(req.body);
        preset.tables.push(newtable);
        console.log(newtable)
        preset.save();
        res.send({ "status": "added", "object": preset });
    } catch (error) {
        console.log(error)
    }
});
router.delete('/delete/:id', async function (req, res, next) {
    try {
        const result = await PresetModel.findOne({ "tables._id": req.params.id });
        result.tables.pull({_id:req.params.id})
        result.save()
        res.send({ "status": "deleted", "object": result })
    } catch (error) {
        res.send(error)
    }
});

router.put('/edit/:id/:restaurant_id', async function (req, res, next) {
    try {

        // const result = await PresetModel.findOneAndUpdate({restaurant_id:req.params.restaurant_id,"tables._id": req.params.id }, {
        //     $set: {"tables.$":req.body}
        // }, { new: true });
        // console.log(result);

        const result = await PresetModel.findOne({restaurant_id:req.params.restaurant_id,"tables._id": req.params.id });
        const tableindex = result.tables.findIndex((table)=> table._id.toString()===req.params.id);
        let table = result.tables[tableindex];
        for (var key in req.body) {
            table[key] = req.body[key]
        }
        result.save();
        res.send({ "status": "edited", "object": result })
    } catch (error) {
        res.send(error)
        console.log(error)
    }
});
module.exports = router;
