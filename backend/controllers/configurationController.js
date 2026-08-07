const Configuration = require('../models/Configuration');
const Component = require('../models/Component');

// @route POST /api/configurations
// Body: { configName, customerName, customerEmail, componentIds: [id, id, ...], notes, status }
// Prices are always read fresh from the CURRENT component price at save time,
// then frozen into the configuration document (priceAtSelection). This is what
// preserves historical pricing: later component price edits never retroactively
// change an already-saved quotation.
exports.createConfiguration = async (req, res) => {
  try {
    const { configName, customerName, customerEmail, componentIds, notes, status } = req.body;

    if (!configName) return res.status(400).json({ message: 'configName is required' });
    if (!Array.isArray(componentIds) || componentIds.length === 0) {
      return res.status(400).json({ message: 'At least one componentId is required' });
    }

    const components = await Component.find({ _id: { $in: componentIds } });
    if (components.length !== componentIds.length) {
      return res.status(400).json({ message: 'One or more components could not be found' });
    }

    const items = components.map((c) => ({
      component: c._id,
      category: c.category,
      name: c.name,
      brand: c.brand,
      specs: c.specs,
      priceAtSelection: c.price,
    }));

    const configuration = await Configuration.create({
      configName,
      customerName,
      customerEmail,
      items,
      notes,
      status: status || 'finalized',
      createdBy: req.user._id,
    });

    res.status(201).json(configuration);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create configuration', error: err.message });
  }
};

// @route GET /api/configurations?search=&status=&sort=-createdAt&page=1&limit=10
exports.getConfigurations = async (req, res) => {
  try {
    const { search, status, sort, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { configName: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const [configurations, total] = await Promise.all([
      Configuration.find(filter)
        .populate('createdBy', 'name email')
        .sort(sort || '-createdAt')
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Configuration.countDocuments(filter),
    ]);

    res.json({
      data: configurations,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch configurations', error: err.message });
  }
};

// @route GET /api/configurations/:id  -> full component-wise breakdown
exports.getConfigurationById = async (req, res) => {
  try {
    const configuration = await Configuration.findById(req.params.id).populate('createdBy', 'name email');
    if (!configuration) return res.status(404).json({ message: 'Configuration not found' });
    res.json(configuration);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch configuration', error: err.message });
  }
};

// @route PUT /api/configurations/:id
// Editing an existing configuration re-snapshots prices for any NEW component
// selection at CURRENT prices, while leaving other saved configurations untouched.
exports.updateConfiguration = async (req, res) => {
  try {
    const configuration = await Configuration.findById(req.params.id);
    if (!configuration) return res.status(404).json({ message: 'Configuration not found' });

    const { configName, customerName, customerEmail, componentIds, notes, status } = req.body;

    if (componentIds) {
      if (!Array.isArray(componentIds) || componentIds.length === 0) {
        return res.status(400).json({ message: 'At least one componentId is required' });
      }
      const components = await Component.find({ _id: { $in: componentIds } });
      if (components.length !== componentIds.length) {
        return res.status(400).json({ message: 'One or more components could not be found' });
      }
      configuration.items = components.map((c) => ({
        component: c._id,
        category: c.category,
        name: c.name,
        brand: c.brand,
        specs: c.specs,
        priceAtSelection: c.price,
      }));
    }

    if (configName !== undefined) configuration.configName = configName;
    if (customerName !== undefined) configuration.customerName = customerName;
    if (customerEmail !== undefined) configuration.customerEmail = customerEmail;
    if (notes !== undefined) configuration.notes = notes;
    if (status !== undefined) configuration.status = status;

    await configuration.save();
    res.json(configuration);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update configuration', error: err.message });
  }
};

// @route DELETE /api/configurations/:id
exports.deleteConfiguration = async (req, res) => {
  try {
    const configuration = await Configuration.findByIdAndDelete(req.params.id);
    if (!configuration) return res.status(404).json({ message: 'Configuration not found' });
    res.json({ message: 'Configuration deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete configuration', error: err.message });
  }
};

// @route POST /api/configurations/price-preview
// Body: { componentIds: [...] } -> live total + breakdown, WITHOUT saving.
// Used by the builder UI as the user adds/removes components.
exports.pricePreview = async (req, res) => {
  try {
    const { componentIds } = req.body;
    if (!Array.isArray(componentIds) || componentIds.length === 0) {
      return res.json({ items: [], totalPrice: 0 });
    }
    const components = await Component.find({ _id: { $in: componentIds } });
    const items = components.map((c) => ({
      component: c._id,
      category: c.category,
      name: c.name,
      brand: c.brand,
      specs: c.specs,
      price: c.price,
      isActive: c.isActive,
    }));
    const totalPrice = items.reduce((sum, i) => sum + i.price, 0);
    res.json({ items, totalPrice });
  } catch (err) {
    res.status(500).json({ message: 'Failed to compute price preview', error: err.message });
  }
};
