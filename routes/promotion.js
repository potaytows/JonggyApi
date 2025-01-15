var express = require('express');
var router = express.Router();
const Promotion = require('../models/promotion');
const multer = require('multer');
const fs = require('fs');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/addPromotion', upload.single('image'), async (req, res) => {
    try {
        const { name, description, code, discount, minCount, usageLimit, startDate, endDate, display  } = req.body;

        let imageBase64 = null;
        if (req.file) {
            imageBase64 = req.file.buffer.toString('base64'); 
        }

        const promotion = new Promotion({
            name,
            description: description || '', 
            code: code || '',
            discount: parseFloat(discount),
            minCount: parseInt(minCount) || 0, 
            usageLimit: parseInt(usageLimit) || 0,
            image: imageBase64,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            display: display || 'Hide' 
        });

        await promotion.save();
        res.status(201).json({ message: 'Promotion added successfully', promotion });
    } catch (error) {
        res.status(500).json({ message: 'Error adding promotion', error: error.message });
    }
});


router.get('/getAllPromotions', async (req, res) => {
    try {
        const promotions = await Promotion.find();
        res.status(200).json(promotions);
    } catch (error) {
        console.error('Error fetching promotions:', error);
        res.status(500).json({ message: 'Failed to fetch promotions', error });
    }
});
router.get('/coupon', async (req, res) => {
    try {
      const promotions = await Promotion.find({ display: 'Show' });
      res.json(promotions);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching promotions', error });
    }
  });

router.delete('/deletePromotion/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Promotion.findByIdAndDelete(id);
        res.status(200).json({ message: 'Promotion deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting promotion', error });
    }
});


module.exports = router;
