var express = require('express');
var router = express.Router();
const CartModel = require('../models/cart');
const ReservationModel = require('../models/reservation');
const RestaurantModel = require('../models/restaurants');
const moment = require('moment-timezone');
router.post('/reserveTables', async function (req, res, next) {
    try {

        console.log("Start Time:", req.body.startTime);
        console.log("End Time:", req.body.endTime);

        req.body.startTime = moment.utc(req.body.startTime).toDate();
        req.body.endTime = moment.utc(req.body.endTime).toDate();

        console.log("Formatted Start Time:", req.body.startTime);
        console.log("Formatted End Time:", req.body.endTime);

        await ReservationModel.deleteMany({
            username: req.body.username,
            status: "รอการยืนยัน",
            restaurant_id: req.body.restaurant_id
        });

        let newReservation = new ReservationModel(req.body);

        // Find the menus
        let menus = await CartModel.find({
            username: req.body.username,
            restaurantId: req.body.restaurant_id
        });

        newReservation.orderedFood = menus;
        newReservation.status = "รอการยืนยัน";
        await newReservation.save();

        await CartModel.deleteMany({
            username: req.body.username,
            restaurantId: req.body.restaurant_id
        });

        res.send({ status: "reserved successfully", obj: newReservation });
    } catch (error) {
        res.send(error);
    }
});




router.get('/getReservationByRestaurantID/:id', async function (req, res, next) {
    try {
        const result = await ReservationModel.find({ restaurant_id: req.params.id })
        .populate("reservedTables")
        .populate("orderedFood.selectedTables", "-x -y")
        .populate("orderedFood.selectedMenuItem", "-menu_icon")
        .populate("orderedFood.selectedAddons")
        .populate("restaurant_id", "-restaurantIcon")
        .sort({ createdAt: -1 })
        res.json(result)
    } catch (error) {
        res.send(error)
    }

});
router.get('/getReservationsByUsername/:username', async function (req, res, next) {
    try {
        const { username } = req.params;
        const { restaurantId } = req.query; 

        const filter = { username: username };
        if (restaurantId) {
            filter.restaurant_id = restaurantId; 
        }

        const result = await ReservationModel.find(filter)
            .populate("reservedTables")
            .populate("orderedFood.selectedTables", "-x -y")
            .populate("orderedFood.selectedMenuItem", "-menu_icon")
            .populate("orderedFood.selectedAddons")
            .populate("restaurant_id", "-restaurantIcon")
            .sort({ createdAt: -1 });

        res.json(result);
    } catch (error) {
        res.status(500).send(error);
        console.log(error)
    }
});
router.get('/getReservationsById/:id', async function (req, res, next) {
    try {
        const { id } = req.params; 
        const result = await ReservationModel.find({_id:id})
            .populate("reservedTables")
            .populate("orderedFood.selectedTables", "-x -y")
            .populate("orderedFood.selectedMenuItem", "-menu_icon")
            .populate("orderedFood.selectedAddons")
            .populate("restaurant_id", "-restaurantIcon")
            .sort({ createdAt: -1 });

        res.json(result);
    } catch (error) {
        res.status(500).send(error);
        console.log(error)
    }
});
router.get('/getActiveReservation/:username', async function (req, res, next) {
    try {
        const { username } = req.params;
        const { restaurantId } = req.query;

        const filter = { 
            username: username, 
            status: { $ne: "เสร็จสิ้นแล้ว" } 
        };

        if (restaurantId) {
            filter.restaurant_id = restaurantId; 
        }

        const result = await ReservationModel.find(filter)
            .populate("reservedTables")
            .populate("orderedFood.selectedTables", "-x -y")
            .populate("orderedFood.selectedMenuItem", "-menu_icon")
            .populate("orderedFood.selectedAddons")
            .populate("restaurant_id", "-restaurantIcon")
            .sort({ createdAt: -1 });

        res.json(result);
    } catch (error) {
        res.status(500).send(error);
        console.log(error);
    }
});




router.delete('/cancelReservation/:id', async function (req, res, next) {
    try {
        const { username } = req.body; 
        const reservation = await ReservationModel.findById(req.params.id);
        if (!reservation) {
            return res.status(404).send({ status: "Reservation not found" });
        }
        const cancelledAtThailand = moment().tz("Asia/Bangkok").toDate();
        reservation.cancellation = {
            cancelledBy: username,
            cancelledAt: cancelledAtThailand
        };
        await reservation.save(); 
        res.send({ 
            status: "Reservation cancelled successfully", 
            cancelledAt: cancelledAtThailand,
            reservation 
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
router.put('/confirmReservation/:id', async function (req, res, next) {
    try {
        const result = await ReservationModel.findByIdAndUpdate(req.params.id, { status: "ยืนยันแล้ว" }, { new: true });
        if (result) {
            res.send({ status: "confirmed successfully", obj: result });
        } else {
            res.status(404).send({ status: "reservation not found" });
        }
    } catch (error) {
        res.send(error);
    }
});
router.put('/successReservation/:id', async function (req, res, next) {
    try {
        const result = await ReservationModel.findByIdAndUpdate(req.params.id, { status: "เสร้จสิ้นแล้ว" }, { new: true });
        if (result) {
            res.send({ status: "confirmed successfully", obj: result });
        } else {
            res.status(404).send({ status: "reservation not found" });
        }
    } catch (error) {
        res.send(error);
    }
});

router.put('/cancelReservation/:id', async function (req, res, next) {
    try {
        const result = await ReservationModel.findByIdAndUpdate(req.params.id, { status: "ยกเลิกการจองแล้ว", status_CheckIn: "checkOut" }, { new: true });
        if (result) {
            res.send({ status: "confirmed successfully", obj: result });
        } else {
            res.status(404).send({ status: "reservation not found" });
        }
    } catch (error) {
        res.send(error);
    }
});
router.get('/getLocationById/:id', async function (req, res, next) {
    try {
        const restaurant = await RestaurantModel.findById(req.params.id);
        if (restaurant) {
            res.json({
                address: restaurant.location.address,
                coordinates: restaurant.location.coordinates
            });
        } else {
            res.status(404).send({ status: "Restaurant not found" });
        }
    } catch (error) {
        res.status(500).send(error);
    }
});
router.put('/statusLocation/:id', async function (req, res, next) {
    try {
        const result = await ReservationModel.findByIdAndUpdate(req.params.id, { statusLocation: "showLocation" }, { new: true });
        if (result) {
            res.send({ status: "statusLocation updated to showLocation", obj: result });
        } else {
            res.status(404).send({ status: "reservation not found" });
        }
    } catch (error) {
        res.status(500).send(error);
    }
});
router.get('/userLocation/:id', async (req, res) => {
    try {
        const reservationID = req.params.id;
        const reservation = await ReservationModel.findById(reservationID);
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }
        res.status(200).json({ locationCustomer: reservation.locationCustomer });
    } catch (error) {
        console.error('Error fetching locationCustomer:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/getReservedTimes/:restaurantId', async (req, res) => {
    const { restaurantId } = req.params;

    try {
        const currentTime = moment.tz('Asia/Bangkok');

        const reservations = await ReservationModel.find({ restaurant_id: restaurantId ,status: { $nin: ["ยกเลิกการจองแล้ว", "เสร็จสิ้นแล้ว"] },
})
            .select('reservedTables startTime endTime')
            .populate('reservedTables', 'text');

        let reservedTimes = {};

        reservations.forEach(reservation => {
            if (moment(reservation.startTime).tz('Asia/Bangkok').isAfter(currentTime)) {
                reservation.reservedTables.forEach(table => {
                    if (!reservedTimes[table._id]) {
                        reservedTimes[table._id] = [];
                    }
                    reservedTimes[table._id].push({
                        startTime: reservation.startTime,
                        endTime: reservation.endTime,
                    });
                });
            }
        });

        console.log(reservedTimes);
        return res.status(200).json(reservedTimes);
    } catch (error) {
        console.error('Error fetching reserved times:', error);
        return res.status(500).json({ error: 'An error occurred while fetching reserved times.' });
    }
});

module.exports = router;
