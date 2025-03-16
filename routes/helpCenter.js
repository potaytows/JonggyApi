const express = require('express');
const router = express.Router();
const HelpModel = require('../models/helpCenter');


router.post('/supportForm', async (req, res) => {
    try {
        const { reservationId, username,restaurant_id, email, topic, details,whosend } = req.body;

        if ( !reservationId || !username ||!email ||!restaurant_id || !topic || !details ||!whosend  ) {
            return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }
        const supportForm = new HelpModel({ reservationId, username, restaurant_id, email, topic, details, whosend });
        await supportForm.save();

        res.status(201).json({ message: 'ส่งแบบฟอร์มสำเร็จ', data: supportForm });
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกแบบฟอร์ม' });
    }
});

router.get('/', async (req, res) => {
    try {
        const forms = await HelpModel.find().populate('reservationId')
        .populate("restaurant_id")
        ;
        res.status(200).json(forms);
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const form = await HelpModel.findById(req.params.id).populate('reservationId')
        .populate("restaurant_id")
            ;
        if (!form) {
            return res.status(404).json({ error: 'ไม่พบข้อมูลแบบฟอร์ม' });
        }
        res.status(200).json(form);
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
});
router.get('/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const userReports = await HelpModel.find({ username }).populate('reservationId')
        .populate("restaurant_id")
        ;
        console.log()
        if (userReports.length === 0) {
            return res.status(404).json({ error: 'ไม่พบข้อมูลการรายงานของผู้ใช้' });
        }

        res.status(200).json(userReports);
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await HelpModel.findByIdAndDelete(id);
        res.status(200).json({ message: ' deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting promotion', error });
    }
});


module.exports = router;
