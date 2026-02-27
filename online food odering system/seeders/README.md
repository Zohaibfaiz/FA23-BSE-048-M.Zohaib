# Database Seeders

This folder contains scripts to populate your database with sample data for testing and development.

## Available Seeders

### 1. Menu Items Seeder
Adds 20 sample menu items across different categories:
- Pizza (4 items)
- Burgers (3 items)
- Salads (2 items)
- Pasta (3 items)
- Appetizers (2 items)
- Sides (2 items)
- Desserts (2 items)
- Beverages (3 items)

### 2. Orders Seeder
Adds 8 sample orders with different statuses:
- Pending
- Confirmed
- Preparing
- Out for Delivery
- Delivered

## How to Use

### Seed Menu Items Only
```bash
node seeders/seedMenuItems.js
```
or
```bash
npm run seed:menu
```

### Seed Orders Only
```bash
node seeders/seedOrders.js
```
or
```bash
npm run seed:orders
```

### Seed Everything
```bash
npm run seed:all
```

## Important Notes

- Seeders will **NOT** run if data already exists in the database
- To re-seed, you must first delete existing data
- Make sure your database connection is configured in `.env` file
- The server must NOT be running when you execute seeders

## Clearing Data

To clear all data and re-seed:

1. Stop your server if running
2. Delete data from database (use MySQL Workbench or command line)
3. Run the seeder scripts again

### MySQL Command to Clear Data
```sql
DELETE FROM MenuItems;
DELETE FROM Orders;
DELETE FROM OrderItems;
```

## Sample Data Details

### Menu Items Include:
- Realistic names and descriptions
- Prices ranging from $2.49 to $18.99
- All items marked as available
- Categorized for easy filtering

### Orders Include:
- Customer names and phone numbers
- Various order statuses
- Realistic data for testing order management

## Troubleshooting

**Error: "Database already has X items"**
- This means data exists. Clear the database first if you want to re-seed.

**Error: "Cannot connect to database"**
- Check your `.env` file configuration
- Make sure MySQL server is running
- Verify database credentials

**Error: "Table doesn't exist"**
- Run your application first to create tables
- Or run migrations if you have them set up
