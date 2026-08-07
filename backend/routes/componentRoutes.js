const express = require('express');
const router = express.Router();
const {
  getComponents,
  getCategories,
  getComponentById,
  createComponent,
  updateComponent,
  deleteComponent,
} = require('../controllers/componentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/categories', getCategories);
router.get('/', getComponents);
router.get('/:id', getComponentById);
router.post('/', createComponent);
router.put('/:id', updateComponent);
router.delete('/:id', deleteComponent);

module.exports = router;
