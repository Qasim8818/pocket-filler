const express = require('express');
const router = express.Router();
const associatesController = require('../controllers/associatesController');

router.post('/addUser', associatesController.addUser);
router.post('/addManually', associatesController.addManually);
router.get('/getAssociates', associatesController.getAssociates);
router.delete('/removeAssociate/:associateId', associatesController.removeAssociate);
router.get('/getStatus/:associateId', associatesController.getStatus);

router.post('/acceptAssociate/:associateId', associatesController.acceptAssociate);
router.post('/rejectAssociate/:associateId', associatesController.rejectAssociate);

module.exports = router;
