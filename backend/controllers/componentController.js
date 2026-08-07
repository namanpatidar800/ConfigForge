const Component = require('../models/Component');

// @route GET /api/components?category=RAM&search=ddr5&active=true
exports.getComponents = async (req, res) => {
  try {
    const { category, search, active } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (active === 'true') filter.isActive = true;
    if (active === 'false') filter.isActive = false;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { specs: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }
    const components = await Component.find(filter).sort({ category: 1, name: 1 });
    res.json(components);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch components', error: err.message });
  }
};

// @route GET /api/components/categories
exports.getCategories = async (req, res) => {
  res.json(Component.CATEGORIES);
};

// @route GET /api/components/:id
exports.getComponentById = async (req, res) => {
  try {
    const component = await Component.findById(req.params.id);
    if (!component) return res.status(404).json({ message: 'Component not found' });
    res.json(component);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch component', error: err.message });
  }
};

// @route POST /api/components
exports.createComponent = async (req, res) => {
  try {
    const { category, name, brand, specs, sku, price } = req.body;
    if (!category || !name || price === undefined) {
      return res.status(400).json({ message: 'category, name and price are required' });
    }
    if (!Component.CATEGORIES.includes(category)) {
      return res.status(400).json({ message: `category must be one of: ${Component.CATEGORIES.join(', ')}` });
    }
    const component = await Component.create({
      category,
      name,
      brand,
      specs,
      sku: sku || undefined,
      price,
      createdBy: req.user._id,
      priceHistory: [{ price, note: 'Initial price on creation' }],
    });
    res.status(201).json(component);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'SKU already exists' });
    res.status(500).json({ message: 'Failed to create component', error: err.message });
  }
};

// @route PUT /api/components/:id
// If price changes, the OLD price is archived into priceHistory before overwriting,
// so the component's own price-change audit trail is preserved. This never touches
// configurations that already snapshotted the old price.
exports.updateComponent = async (req, res) => {
  try {
    const component = await Component.findById(req.params.id);
    if (!component) return res.status(404).json({ message: 'Component not found' });

    const { category, name, brand, specs, sku, price, isActive, note } = req.body;

    if (price !== undefined && Number(price) !== component.price) {
      component.priceHistory.push({ price: component.price, note: note || 'Superseded by update' });
      component.price = price;
    }
    if (category !== undefined) {
      if (!Component.CATEGORIES.includes(category)) {
        return res.status(400).json({ message: `category must be one of: ${Component.CATEGORIES.join(', ')}` });
      }
      component.category = category;
    }
    if (name !== undefined) component.name = name;
    if (brand !== undefined) component.brand = brand;
    if (specs !== undefined) component.specs = specs;
    if (sku !== undefined) component.sku = sku;
    if (isActive !== undefined) component.isActive = isActive;

    await component.save();
    res.json(component);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'SKU already exists' });
    res.status(500).json({ message: 'Failed to update component', error: err.message });
  }
};

// @route DELETE /api/components/:id
// Soft delete only (isActive = false). Hard deleting would orphan references
// inside past configuration snapshots' `component` field lookups.
exports.deleteComponent = async (req, res) => {
  try {
    const component = await Component.findById(req.params.id);
    if (!component) return res.status(404).json({ message: 'Component not found' });
    component.isActive = false;
    await component.save();
    res.json({ message: 'Component deactivated', component });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete component', error: err.message });
  }
};
