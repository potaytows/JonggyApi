var express = require('express');
var router = express.Router();
var MenuModel = require('../models/menu');
const RestaurantModel = require('../models/restaurants');
var fs = require('fs');
var path = require('path');
const mongoose = require('mongoose')
const addonModel = require('../models/addons');
const moment = require('moment-timezone')
var multer = require('multer');
const reservation = require('../models/reservation');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, '-' + uniqueSuffix)
    }
});
var upload = multer({ storage: storage, limits: 1024 * 1024 * 5 });
router.get('/getMenus/:id', async function (req, res, next) {
    try {
        const id = req.params.id;

        // Find the menu items for the given restaurant and exclude the menu_icon field
        const menu = await MenuModel.find({ restaurant_id: id }).select('-menu_icon');

        // Perform aggregation to find the reservation counts for each menu item with status "ยืนยันแล้ว"
        const reservedMenuItems = await reservation.aggregate([
            // Match reservations for the specific restaurant and only include "ยืนยันแล้ว" status
            { $match: { 
                restaurant_id: new mongoose.Types.ObjectId(id),
                status: "ยืนยันแล้ว" // Only include reservations with this status
            } },

            // Unwind the orderedFood array to flatten the structure
            { $unwind: "$orderedFood" },

            // Unwind the selectedMenuItem array to flatten it
            { $unwind: "$orderedFood.selectedMenuItem" },

            // Group by selectedMenuItem and sum the "Count" to track how many times each menu item was ordered
            { 
                $group: {
                    _id: "$orderedFood.selectedMenuItem",  // Group by Menu item ID
                    count: { $sum: "$orderedFood.Count" }  // Sum the "Count" to track how many times each menu item was ordered
                }
            },

            // Sort by count in descending order to get the most ordered items first
            { $sort: { count: -1 } }
        ]);

        // Add the reservation count to the menu items based on their _id
        const menuWithReservationCount = menu.map(item => {
            // Find the corresponding reservation count for this menu item
            const reservation = reservedMenuItems.find(res => res._id.toString() === item._id.toString());
            item.reservationCount = reservation ? reservation.count : 0; // If no reservation, set to 0
            return item;
        });

        // Sort the menu items by reservationCount in descending order
        menuWithReservationCount.sort((a, b) => b.reservationCount - a.reservationCount);

        // Send both the list of menu items and the most reserved item
        res.json({ menus: menuWithReservationCount });

    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

router.get('/getMenu/:id', async function (req, res, next) {
    try {
        const id = req.params.id
        // const restaurant = await RestaurantModel.findOne({owner:id})
        const menu = await MenuModel.findOne({ _id: id }, { menu_icon: 0 });
        res.json(menu)
    } catch (error) {
        res.send(error)
    }
});

router.get('/getMenusByUsername/:id', async function (req, res, next) {
    try {
        const id = req.params.id;

        // Find the restaurant owned by the given user
        const restaurant = await RestaurantModel.findOne({ owner: id });

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found for this owner' });
        }

        // Perform aggregation to find the reservation counts for each menu item
        const reservedMenuItems = await reservation.aggregate([
            // Match reservations for the specific restaurant and only include "ยืนยันแล้ว" status
            { $match: { 
                restaurant_id: new mongoose.Types.ObjectId(restaurant._id),
                status: "ยืนยันแล้ว" // Only include reservations with this status
            } },

            // Unwind the orderedFood array to flatten the structure
            { $unwind: "$orderedFood" },

            // Unwind the selectedMenuItem array to flatten it
            { $unwind: "$orderedFood.selectedMenuItem" },

            // Group by selectedMenuItem and count how many times each menu item appears (number of times ordered)
            { 
                $group: {
                    _id: "$orderedFood.selectedMenuItem",  // Group by Menu item ID
                    count: { $sum: "$orderedFood.Count" }  // Sum the "Count" to track how many times each menu item was ordered
                }
            },

            // Sort by count in descending order to get the most ordered items first
            { $sort: { count: -1 } }
        ]);

        // Fetch menu items for the restaurant
        const sortedMenuItems = await MenuModel.find({ 
            restaurant_id: restaurant._id 
        }).select('-menu_icon').lean();

        // Add the reservation count to the menu items based on their _id
        const menuWithReservationCount = sortedMenuItems.map(item => {
            // Find the corresponding reservation count for this menu item
            const reservation = reservedMenuItems.find(res => res._id.toString() === item._id.toString());
            item.reservationCount = reservation ? reservation.count : 0; // If no reservation, set to 0
            return item;
        });

        // Sort the menu items by reservationCount in descending order
        menuWithReservationCount.sort((a, b) => b.reservationCount - a.reservationCount);

        console.log(menuWithReservationCount)
        res.json({menus:menuWithReservationCount});

    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});


router.post('/uploadImage/:id', upload.single('image'), async function (req, res, next) {
    console.log(req.file)
    if (req.file) {
        filename = "/../uploads/" + req.file.filename
    }
    try {
        const newMenu = await MenuModel.findOne({
            '_id': req.params.id
        })
        newMenu.menu_icon = {
            data: fs.readFileSync(path.join(__dirname + filename)),
            contentType: 'image/png'
        },
            newMenu.save();
        res.send({ "status": "uploaded succesfully" })
    } catch (error) {
        res.status(400).send(error)
        console.log(error)
    } finally {
        if (req.file) {
            fs.unlinkSync(path.join(__dirname + "/../uploads/" + req.file.filename))
        }
    }
});

router.post('/uploadImage/:id/default', async function (req, res, next) {
    filename = "/../assets/default-menu"
    try {
        const newMenu = await MenuModel.findOne({
            '_id': req.params.id
        })
        newMenu.menu_icon = {
            data: fs.readFileSync(path.join(__dirname + filename)),
            contentType: 'image/png'
        },
            newMenu.save();
        res.send({ "status": "uploaded succesfully" })
    } catch (error) {
        res.status(400).send(error)
        console.log(error)
    }
});


router.post('/addMenu/:id', async function (req, res, next) {
    const id = req.params.id
    const restaurant = await RestaurantModel.findOne({ owner: id }, { restaurantIcon: 0, _id: 1 })

    if (restaurant) {
        try {
            const newMenu = new MenuModel({ menuName: req.body.menuName, price: req.body.price, restaurant_id: restaurant._id })
            newMenu.restaurant_id = restaurant._id
            const result = await newMenu.save();
            console.log(newMenu)
            res.send({ "status": "added", "object": result })

        } catch (error) {
            res.send(error)
        }

    }


});

router.put('/edit/:id', async function (req, res, next) {
    try {
        const result = await MenuModel.findByIdAndUpdate({ _id: req.params.id }, {
            $set: req.body
        }, { new: true ,select: '-menu_icon'});
        res.send({ "status": "edited", "object": result })
        console.log(result)
    } catch (error) {
        res.send(error)
    }
});

router.delete('/delete/:id', async function (req, res, next) {
    try {
        const addons = await addonModel.deleteMany({ menu_id: req.params.id });
        const result = await MenuModel.findOneAndDelete({ _id: req.params.id }, {
            $set: req.body
        }, { new: true });
        res.send({ "status": "deleted", "object": result })
        console.log(result)
    } catch (error) {
        res.send(error)
    }
});

function getDateRange(daysAgo) {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - daysAgo);

    pastDate.setHours(0, 0, 0, 0);

    today.setHours(23, 59, 59, 999);

    return { today, pastDate };
}

async function countMenuOrders(menuId, daysAgo = 0) {
    const { today, pastDate } = getDateRange(daysAgo);  
    console.log(today);
    console.log(pastDate)


    if (!mongoose.Types.ObjectId.isValid(menuId)) {
        throw new Error("Invalid menuId");
    }

    const menuObjectId = new mongoose.Types.ObjectId(menuId);  

   
    const pipeline = [
        {
            $match: {
                'orderedFood.selectedMenuItem': { $in: [menuObjectId] },  // Match the selected menu item
                status: 'ยืนยันแล้ว',  // Only consider orders with confirmed status
                createdAt: {
                    $gte: pastDate,  // Ensure startTime is greater than or equal to pastDate
                    $lte: today      // Ensure startTime is less than or equal to today
                }
            }
        },
        {
            $unwind: '$orderedFood'  
        },
        {
            $match: {
                'orderedFood.selectedMenuItem': { $in: [menuObjectId] }  
            }
        },
        {
            $group: {
                _id: '$orderedFood.selectedMenuItem',  
                totalCount: { $sum: '$orderedFood.Count' }  
            }
        }
    ];

    try {
        const result = await reservation.aggregate(pipeline);
        console.log(result);
        return result.length > 0 ? result[0].totalCount : 0;
    } catch (error) {
        console.error('Aggregation error:', error);
        return 0;
    }
}


router.get('/:menuId/order-counts', async (req, res) => {
    const { menuId } = req.params;
    console.log(menuId)

    try {
        const ordersToday = await countMenuOrders(menuId, 0); 
        const ordersLast30Days = await countMenuOrders(menuId, 30);  
        const ordersLast7Days = await countMenuOrders(menuId, 7);  
        const ordersAllTime = await countMenuOrders(menuId, Infinity);  

        return res.json({
            ordersToday,
            ordersLast7Days,
            ordersLast30Days,
            ordersAllTime,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching order counts', error });
    }
});

module.exports = router;
