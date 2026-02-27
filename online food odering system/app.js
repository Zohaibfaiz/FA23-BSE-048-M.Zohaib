const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const { sequelize } = require('./config/database');
const menuItemRoutes = require('./routes/menuItems');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', 'layout');

// Middleware
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));

// Locals for all views
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

// Routes
app.get('/', async (req, res) => {
  try {
    const MenuItem = require('./models/MenuItem');
    const { Order } = require('./models/Order');
    
    // Get featured menu items (limit to 8)
    const featuredItems = await MenuItem.findAll({
      where: { isAvailable: true },
      limit: 8,
      order: [['createdAt', 'DESC']]
    });
    
    // Get statistics
    const totalMenuItems = await MenuItem.count({ where: { isAvailable: true } });
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { status: 'Pending' } });
    
    res.render('index', { 
      title: 'Online Food Ordering System',
      featuredItems,
      stats: {
        totalMenuItems,
        totalOrders,
        pendingOrders
      }
    });
  } catch (error) {
    console.error('Error loading home page:', error);
    res.render('index', { 
      title: 'Online Food Ordering System',
      featuredItems: [],
      stats: { totalMenuItems: 0, totalOrders: 0, pendingOrders: 0 }
    });
  }
});

app.use('/menu-items', menuItemRoutes);
app.use('/orders', orderRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// Start server after DB sync
sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to sync database:', err);
  });

