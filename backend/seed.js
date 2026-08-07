require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Component = require('./models/Component');
const Configuration = require('./models/Configuration');

const components = [
  { category: 'Processor', name: 'Intel Core i5-1340P', brand: 'Intel', specs: '12-core, up to 4.6GHz', sku: 'CPU-I5-1340P', price: 18500 },
  { category: 'Processor', name: 'Intel Core i7-1360P', brand: 'Intel', specs: '12-core, up to 5.0GHz', sku: 'CPU-I7-1360P', price: 26500 },
  { category: 'Processor', name: 'AMD Ryzen 7 7840HS', brand: 'AMD', specs: '8-core, up to 5.1GHz', sku: 'CPU-R7-7840HS', price: 24000 },
  { category: 'RAM', name: '8GB DDR4 3200MHz', brand: 'Kingston', specs: 'SODIMM', sku: 'RAM-8-DDR4', price: 2200 },
  { category: 'RAM', name: '16GB DDR5 4800MHz', brand: 'Corsair', specs: 'SODIMM', sku: 'RAM-16-DDR5', price: 4800 },
  { category: 'RAM', name: '32GB DDR5 5600MHz', brand: 'Corsair', specs: 'SODIMM Dual Channel', sku: 'RAM-32-DDR5', price: 9500 },
  { category: 'Storage', name: '512GB NVMe SSD', brand: 'Samsung', specs: 'PCIe Gen4', sku: 'STG-512-NVME', price: 3800 },
  { category: 'Storage', name: '1TB NVMe SSD', brand: 'Samsung', specs: 'PCIe Gen4', sku: 'STG-1TB-NVME', price: 6800 },
  { category: 'Storage', name: '2TB NVMe SSD', brand: 'WD Black', specs: 'PCIe Gen4', sku: 'STG-2TB-NVME', price: 12500 },
  { category: 'Graphics Card', name: 'Integrated Iris Xe', brand: 'Intel', specs: 'Integrated', sku: 'GPU-IRIS-XE', price: 0 },
  { category: 'Graphics Card', name: 'NVIDIA RTX 4050 6GB', brand: 'NVIDIA', specs: 'Laptop GPU', sku: 'GPU-RTX4050', price: 15000 },
  { category: 'Graphics Card', name: 'NVIDIA RTX 4070 8GB', brand: 'NVIDIA', specs: 'Laptop GPU', sku: 'GPU-RTX4070', price: 32000 },
  { category: 'Display', name: '14" FHD IPS 60Hz', brand: 'Generic', specs: '1920x1080', sku: 'DSP-14-FHD', price: 4000 },
  { category: 'Display', name: '15.6" QHD 165Hz', brand: 'Generic', specs: '2560x1440', sku: 'DSP-156-QHD', price: 9500 },
  { category: 'Display', name: '16" 4K OLED 120Hz', brand: 'Samsung', specs: '3840x2400', sku: 'DSP-16-4K-OLED', price: 18000 },
  { category: 'Battery', name: '4-Cell 56Wh', brand: 'Generic', specs: 'Up to 8 hours', sku: 'BAT-56WH', price: 2500 },
  { category: 'Battery', name: '6-Cell 90Wh', brand: 'Generic', specs: 'Up to 14 hours', sku: 'BAT-90WH', price: 4200 },
  { category: 'Keyboard', name: 'Standard Backlit Keyboard', brand: 'Generic', specs: 'White backlight', sku: 'KBD-STD-BL', price: 1200 },
  { category: 'Keyboard', name: 'RGB Mechanical Keyboard', brand: 'Generic', specs: 'Per-key RGB', sku: 'KBD-RGB-MECH', price: 3500 },
  { category: 'Operating System', name: 'Windows 11 Home', brand: 'Microsoft', specs: 'OEM License', sku: 'OS-WIN11-HOME', price: 6500 },
  { category: 'Operating System', name: 'Windows 11 Pro', brand: 'Microsoft', specs: 'OEM License', sku: 'OS-WIN11-PRO', price: 11000 },
  { category: 'Operating System', name: 'FreeDOS / No OS', brand: 'N/A', specs: 'No pre-installed OS', sku: 'OS-FREEDOS', price: 0 },
];

const run = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([User.deleteMany({}), Component.deleteMany({}), Configuration.deleteMany({})]);

  console.log('Creating default user...');
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin@123',
  });

  console.log('Creating components...');
  const created = await Component.insertMany(
    components.map((c) => ({ ...c, createdBy: admin._id, priceHistory: [{ price: c.price, note: 'Initial seed price' }] }))
  );

  console.log('Creating a sample historical configuration...');
  const byName = (name) => created.find((c) => c.name === name);
  const sampleParts = [
    byName('Intel Core i7-1360P'),
    byName('16GB DDR5 4800MHz'),
    byName('1TB NVMe SSD'),
    byName('NVIDIA RTX 4050 6GB'),
    byName('15.6" QHD 165Hz'),
    byName('6-Cell 90Wh'),
    byName('Standard Backlit Keyboard'),
    byName('Windows 11 Pro'),
  ];
  await Configuration.create({
    configName: 'Sample Business Ultrabook',
    customerName: 'Acme Corp',
    customerEmail: 'procurement@acme.example',
    items: sampleParts.map((c) => ({
      component: c._id,
      category: c.category,
      name: c.name,
      brand: c.brand,
      specs: c.specs,
      priceAtSelection: c.price,
    })),
    status: 'finalized',
    createdBy: admin._id,
    notes: 'Seeded sample quotation for demo purposes.',
  });

  console.log('Seed complete.');
  console.log('Login with: admin@example.com / Admin@123');
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});