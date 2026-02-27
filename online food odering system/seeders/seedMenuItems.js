const { sequelize } = require('../config/database');
const MenuItem = require('../models/MenuItem');

const sampleMenuItems = [
  {
    name: 'Margherita Pizza',
    description: 'Classic Italian pizza with fresh mozzarella, tomatoes, and basil',
    price: 12.99,
    category: 'Pizza',
    isAvailable: true
  },
  {
    name: 'Pepperoni Pizza',
    description: 'Traditional pizza topped with pepperoni and mozzarella cheese',
    price: 14.99,
    category: 'Pizza',
    isAvailable: true
  },
  {
    name: 'Classic Burger',
    description: 'Juicy beef patty with lettuce, tomato, onion, and special sauce',
    price: 10.99,
    category: 'Burgers',
    isAvailable: true
  },
  {
    name: 'Cheese Burger',
    description: 'Classic burger with melted cheddar cheese',
    price: 11.99,
    category: 'Burgers',
    isAvailable: true
  },
  {
    name: 'Chicken Burger',
    description: 'Grilled chicken breast with mayo and fresh vegetables',
    price: 11.49,
    category: 'Burgers',
    isAvailable: true
  },
  {
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan',
    price: 8.99,
    category: 'Salads',
    isAvailable: true
  },
  {
    name: 'Greek Salad',
    description: 'Mixed greens with feta cheese, olives, tomatoes, and cucumber',
    price: 9.49,
    category: 'Salads',
    isAvailable: true
  },
  {
    name: 'Spaghetti Carbonara',
    description: 'Creamy pasta with bacon, eggs, and parmesan cheese',
    price: 13.99,
    category: 'Pasta',
    isAvailable: true
  },
  {
    name: 'Penne Arrabbiata',
    description: 'Spicy tomato sauce with garlic and red chili peppers',
    price: 12.49,
    category: 'Pasta',
    isAvailable: true
  },
  {
    name: 'Fettuccine Alfredo',
    description: 'Rich and creamy white sauce with parmesan cheese',
    price: 13.49,
    category: 'Pasta',
    isAvailable: true
  },
  {
    name: 'Chicken Wings',
    description: 'Crispy wings with your choice of BBQ or buffalo sauce',
    price: 9.99,
    category: 'Appetizers',
    isAvailable: true
  },
  {
    name: 'Mozzarella Sticks',
    description: 'Golden fried mozzarella with marinara sauce',
    price: 7.99,
    category: 'Appetizers',
    isAvailable: true
  },
  {
    name: 'French Fries',
    description: 'Crispy golden fries with sea salt',
    price: 4.99,
    category: 'Sides',
    isAvailable: true
  },
  {
    name: 'Onion Rings',
    description: 'Beer-battered onion rings served with ranch dressing',
    price: 5.99,
    category: 'Sides',
    isAvailable: true
  },
  {
    name: 'Chocolate Cake',
    description: 'Rich chocolate layer cake with chocolate frosting',
    price: 6.99,
    category: 'Desserts',
    isAvailable: true
  },
  {
    name: 'Tiramisu',
    description: 'Classic Italian dessert with coffee-soaked ladyfingers',
    price: 7.49,
    category: 'Desserts',
    isAvailable: true
  },
  {
    name: 'Coca Cola',
    description: 'Refreshing cold Coca Cola',
    price: 2.49,
    category: 'Beverages',
    isAvailable: true
  },
  {
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice',
    price: 3.99,
    category: 'Beverages',
    isAvailable: true
  },
  {
    name: 'Iced Coffee',
    description: 'Cold brew coffee served over ice',
    price: 3.49,
    category: 'Beverages',
    isAvailable: true
  },
  {
    name: 'Vegetarian Pizza',
    description: 'Loaded with bell peppers, mushrooms, olives, and onions',
    price: 13.99,
    category: 'Pizza',
    isAvailable: true
  }
];

async function seedDatabase() {
  try {
    // Sync database
    await sequelize.sync();
    
    // Check if data already exists
    const count = await MenuItem.count();
    
    if (count > 0) {
      console.log(`Database already has ${count} menu items. Skipping seed.`);
      console.log('To re-seed, delete existing items first.');
      process.exit(0);
    }
    
    // Insert sample data
    await MenuItem.bulkCreate(sampleMenuItems);
    
    console.log('✅ Successfully seeded database with 20 menu items!');
    console.log('Categories: Pizza, Burgers, Salads, Pasta, Appetizers, Sides, Desserts, Beverages');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
