const mongoose = require('mongoose');

const CATEGORIES = [
  'Processor',
  'RAM',
  'Storage',
  'Graphics Card',
  'Display',
  'Battery',
  'Keyboard',
  'Operating System',
];

// Every time a component's price changes, the previous price is pushed here.
// This is separate from configuration snapshots (see Configuration model) —
// this trail answers "how has this component's price moved over time?",
// while the configuration snapshot answers "what did this quote cost when we sold it?".
const PriceHistoryEntrySchema = new mongoose.Schema(
  {
    price: { type: Number, required: true },
    changedAt: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const ComponentSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, enum: CATEGORIES },
    name: { type: String, required: true, trim: true },
    brand: { type: String, trim: true, default: '' },
    specs: { type: String, trim: true, default: '' }, // e.g. "16GB DDR5 4800MHz"
    sku: { type: String, trim: true, unique: true, sparse: true },
    price: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true }, // soft delete, keeps old quotes intact
    priceHistory: { type: [PriceHistoryEntrySchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ComponentSchema.index({ category: 1, name: 1 });

ComponentSchema.statics.CATEGORIES = CATEGORIES;

module.exports = mongoose.model('Component', ComponentSchema);
