var express = require('express');
var router = express.Router();
var TableModel = require('../models/tables')
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
        const id = req.params.id
        const tables = await TableModel.findById(id);
        res.json(tables)
    } catch (error) {
        res.send(error)
    }
});
router.get('/getbyRestaurantId/:id', async function (req, res, next) {
    try {
        const id = req.params.id
        const tables = await TableModel.find({ restaurant_id: id }, { updatedAt: 0, createdAt: 0 });
        res.json(tables)
    } catch (error) {
        res.send(error)
    }
});
router.get('/changestatus/:id', async function (req, res, next) {
    try {
        const table = await TableModel.findOne({_id:req.params.id});
        console.log(table)
        if(table.status === "enabled"){
            table.status = "disabled";
            table.save();
            res.json(table);
            
        }else if (table.status === "disabled"){
            table.status = "enabled";
            table.save();
            res.json(table);
        }
    } catch (error) {
        res.send(error)
    }
});


router.post('/addTable', async function (req, res, next) {

    try {
        const newTable = new TableModel(req.body)
        console.log(newTable)
        const result = await newTable.save();
        res.send({ "status": "added", "object": result });
        console.log(result);
    } catch (error) {
        res.send(error)
    }



});
router.delete('/delete/:id', async function (req, res, next) {
    try {
        const result = await TableModel.findOneAndDelete({ _id: req.params.id });
        res.send({ "status": "deleted", "object": result })
    } catch (error) {
        res.send(error)
    }
});

router.put('/edit/:id', async function (req, res, next) {
    try {
        const result = await TableModel.findByIdAndUpdate({ _id: req.params.id }, {
            $set: req.body
        }, { new: true });
        res.send({ "status": "edited", "object": result })
    } catch (error) {
        res.send(error)
    }
});
module.exports = router;
