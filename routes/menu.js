var express = require('express');
var router = express.Router();
var Menu = require('../models/menu');

router.get('/', async function (req, res, next) {
    try {
        const newMenu = await Menu.find();
        res.json(newMenu)
    } catch (error) {
        res.send(error)
    }

});
router.get('/:id', async function (req, res, next) {
    try{
    const id = req.params.id
    const newMenu = await Menu.findById(id);
    res.json(newMenu)
    }catch(error){
        res.send(error)
    }
});

router.post('/addMenu', async function (req, res, next) {

    try {
        const newMenu = new Menu(req.body)
        const result = await newMenu.save();
        res.send({ "status": "added", "object": result })

    } catch (error) {
        res.send(error)
    }

});

module.exports = router;
