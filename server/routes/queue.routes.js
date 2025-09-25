const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queue.controller');

router.post('/', queueController.createQueue);
router.get('/:id', queueController.getQueue);
router.get('/vapidPublicKey', queueController.getVapidPublicKey);

module.exports = router;