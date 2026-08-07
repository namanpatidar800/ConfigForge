const mongoose = require('mongoose');

// A snapshot line item. This is a COPY of the component's data at the moment
// the configuration was saved. It intentionally does NOT live-join against
// the Component collection for price, so that:
//   1. Editing a component's price later never changes past quotations.
//   2. Deleting/deactivating a component never breaks old quotations.
const ConfigItemSchema = new mongoose.Schema(
  {
    component: { type: mongoose.Schema.Types.ObjectId, ref: 'Component', required: true },
    category: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String, default: '' },
    specs: { type: String, default: '' },
    priceAtSelection: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ConfigurationSchema = new mongoose.Schema(
  {
    configName: { type: String, required: true, trim: true },
    customerName: { type: String, trim: true, default: '' },
    customerEmail: { type: String, trim: true, default: '' },
    items: {
      type: [ConfigItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'A configuration must include at least one component.',
      },
    },
    totalPrice: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['draft', 'finalized'], default: 'finalized' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

ConfigurationSchema.index({ configName: 'text', customerName: 'text', customerEmail: 'text' });

// Recompute total from snapshot prices whenever items change, so the stored
// total always matches the sum of the frozen line-item prices.
ConfigurationSchema.pre('validate', function (next) {
  if (this.items && this.items.length) {
    this.totalPrice = this.items.reduce((sum, i) => sum + i.priceAtSelection, 0);
  }
  next();
});

module.exports = mongoose.model('Configuration', ConfigurationSchema);
