const express = require('express');
const router = express.Router();
const associatesController = require('../controllers/associatesController');

router.post('/addUser', associatesController.addUser);
router.post('/addManually', associatesController.addManually);
router.get('/getAssociates', associatesController.getAssociates);
router.delete('/removeAssociate/:associateId', associatesController.removeAssociate);
router.get('/getStatus/:associateId', associatesController.getStatus);

module.exports = router;
