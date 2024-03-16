var express = require('express');
var router = express.Router();
const CartModel = require('../models/cart');

router.get('/getCart', async function (req, res, next) {
    try {
        const id = req.params.id
        const Cart = await CartModel.findAll()
        res.send(Cart)
    } catch (error) {
        res.send(error)
    }
});
router.get('/getCart/:id', async function (req, res, next) {
    try {
        const id = req.params.id
        const Cart = await CartModel.findOne({ _id: id });
        res.send(Cart)
    } catch (error) {
        res.send(error)
    }
});
router.get('/getByRestaurantID/:id', async function (req, res, next) {
    try {
        const id = req.params.id
        const Cart = await CartModel.find({ restaurantId: id });
        res.send(Cart)
    } catch (error) {
        res.send(error)
    }
});

router.post('/addToCart/', async function (req, res, next) {
    console.log(req.body)
    try {
        const existingCartItem = await CartModel.findOne({
            restaurantId: req.body.restaurantId,
            selectedMenuItem: req.body.selectedMenuItem,
            selectedAddons: req.body.selectedAddons
        });

        if (existingCartItem) {
            existingCartItem.selectedMenuItem.Count += req.body.selectedMenuItem.Count;
            await existingCartItem.save();
            res.send({"status": "added", "obj": existingCartItem});
        } else {
            const newCart = new CartModel(req.body);
            const result = await newCart.save();
            res.send({"status": "added", "obj": result});
        }
    } catch (error) {
        res.status(400).send(error);
        console.log(error);
    }
});
router.get('/deleteCart/:id', async function (req, res, next) {
    console.log(req.params.id)
    const id = req.params.id
    try {
        const result = await CartModel.findOneAndDelete({restaurantId: id})
        res.send({"status":"deleted","obj":result})
    } catch (error) {
        res.status(400).send(error)
        console.log(error)
    }
});


module.exports = router;
