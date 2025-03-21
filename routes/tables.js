var express = require('express');
var router = express.Router();
var TableModel = require('../models/tables');
var PresetModel = require('../models/preset');
var RestaurantModel = require('../models/restaurants');
var ReservationModel = require('../models/reservation');
var moment = require('moment-timezone');

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
        const result = await TableModel.findById(req.params.id);
        console.log(result)
        res.json(result)
    } catch (error) {
        res.send(error)

    }
});
router.get('/getbyRestaurantId/:id', async function (req, res, next) {
    try {
        const id = req.params.id
        const presets = await PresetModel.find({ restaurant_id: id }, { updatedAt: 0, createdAt: 0 });
        const restaurant = await RestaurantModel.findOne({ _id: id }, { updatedAt: 0, createdAt: 0, restaurantIcon: 0 })
            .populate({
                path: 'activePreset',
                populate: {
                    path: 'tables',
                    model: 'Table'
                }
            });
        if (restaurant.activePreset == null || restaurant.activePreset == "" || restaurant == undefined) {
            restaurant.activePreset = presets[0].id
            restaurant.save();
        }
        res.json({ presets: presets, activePreset: restaurant.activePreset })
    } catch (error) {
        res.send(error)
    }
});
router.get('/changestatus/:id', async function (req, res, next) {
    try {
        const table = await TableModel.findOne({ _id: req.params.id });
        if (table.status === "enabled") {
            table.status = "disabled";
            table.save();
            res.json(table);
        } else if (table.status === "disabled") {
            table.status = "enabled";
            table.save();
            res.json(table);
        }
    } catch (error) {
        res.send(error)
        console.log(error)
    }
});


router.post('/addTable', async function (req, res, next) {
    try {
        const restaurant = await RestaurantModel.findOne({ _id: req.body.restaurant_id }, { restaurantIcon: 0 });
        const presetId = restaurant.activePreset;

        const newtable = new TableModel(req.body);
        await newtable.save();

        await PresetModel.findByIdAndUpdate(presetId, { $push: { tables: newtable._id } });

        const updatedPreset = await PresetModel.findById(presetId);

        res.send({ "status": "added", "object": updatedPreset });
    } catch (error) {
        console.log(error)
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
        const result = await TableModel.findOneAndUpdate(
            { _id: req.params.id },
            { $set: req.body });
        console.log(result);
        result.save();
        res.send({ "status": "edited", "object": result })
    } catch (error) {
        res.send(error)
        console.log(error)
    }
});


router.post('/checkconflictedreservedTables', async function (req, res) {
    try {
        const { restaurant_id, reservedTables, startTime, endTime } = req.body;
        if (!restaurant_id || !reservedTables || !startTime || !endTime) {
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }
        const start = moment.utc(startTime).toDate();
        const end = moment.utc(endTime).toDate();
        const conflictingReservations = await ReservationModel.find({
            restaurant_id,
            reservedTables: { $in: reservedTables },
            status: "ยืนยันแล้ว",
            $or: [
                { startTime: { $lt: end }, endTime: { $gt: start } },
            ]
        });
        console.log(conflictingReservations)
        if (conflictingReservations.length > 0) {
            return res.status(409).json({
                message: 'พบการจองที่ซ้ำซ้อน กรุณาเลือกเวลาอื่น',
                conflictingReservations
            });
        }
        return res.status(200).json({ message: 'ไม่มีการจองที่ทับซ้อน สามารถจองโต๊ะได้' });

    } catch (error) {
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ กรุณาลองใหม่' });
    }
});

module.exports = router;
