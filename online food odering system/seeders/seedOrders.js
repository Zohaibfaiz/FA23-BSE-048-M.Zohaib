const { sequelize } = require('../config/database');
const { Order } = require('../models/Order');

const sampleOrders = [
  {
    customerName: 'John Doe',
    customerPhone: '555-0101',
    status: 'Pending'
  },
  {
    customerName: 'Jane Smith',
    customerPhone: '555-0102',
    status: 'Confirmed'
  },
  {
    customerName: 'Mike Johnson',
    customerPhone: '555-0103',
    status: 'Preparing'
  },
  {
    customerName: 'Sarah Williams',
    customerPhone: '555-0104',
    status: 'Out for Delivery'
  },
  {
    customerName: 'David Brown',
    customerPhone: '555-0105',
    status: 'Delivered'
  },
  {
    customerName: 'Emily Davis',
    customerPhone: '555-0106',
    status: 'Pending'
  },
  {
    customerName: 'Chris Wilson',
    customerPhone: '555-0107',
    status: 'Confirmed'
  },
  {
    customerName: 'Amanda Martinez',
    customerPhone: '555-0108',
    status: 'Preparing'
  }
];

async function seedOrders() {
  try {
    // Sync database
    await sequelize.sync();
    
    // Check if data already exists
    const count = await Order.count();
    
    if (count > 0) {
      console.log(`Database already has ${count} orders. Skipping seed.`);
      console.log('To re-seed, delete existing orders first.');
      process.exit(0);
    }
    
    // Insert sample data
    await Order.bulkCreate(sampleOrders);
    
    console.log('✅ Successfully seeded database with 8 sample orders!');
    console.log('Order statuses: Pending, Confirmed, Preparing, Out for Delivery, Delivered');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding orders:', error);
    process.exit(1);
  }
}

seedOrders();
