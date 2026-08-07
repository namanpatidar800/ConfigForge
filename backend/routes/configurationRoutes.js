const express = require('express');
const router = express.Router();
const {
  createConfiguration,
  getConfigurations,
  getConfigurationById,
  updateConfiguration,
  deleteConfiguration,
  pricePreview,
} = require('../controllers/configurationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/price-preview', pricePreview);
router.post('/', createConfiguration);
router.get('/', getConfigurations);
router.get('/:id', getConfigurationById);
router.put('/:id', updateConfiguration);
router.delete('/:id', deleteConfiguration);

module.exports = router;
