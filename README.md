# BrewTrack
BrewTrack – Café Billing & Inventory Management System

A frontend-only café billing and inventory website built with HTML5, CSS3 and vanilla JavaScript. It has no backend, database server, login or build step. All data is stored in the browser’s localStorage.

How to run
Put index.html, style.css and script.js in the same folder.
Open index.html in a modern browser (Chrome, Edge, Firefox or Safari).

No installation, internet connection or server is needed.

Features

Dashboard

Four summary cards: sales today, orders today, menu items and low-stock items.
Sales overview bar chart with a Today / 7 days / 30 days filter.
Low-stock alerts, recent orders and popular items.
All figures are calculated from saved data and update immediately.

Menu Management

Add, edit and delete menu items, with search and category filter.
Categories: Hot Beverages, Cold Beverages, Snacks and Desserts.
Enable or disable an item without losing order history.
Each item has a recipe: ingredients and the quantity used per serving.

Order & Billing

Pick items with quantity steppers and add them to the cart.
Change quantities, remove items or clear the cart.
Subtotal, tax (default 5%) and total are calculated automatically and rounded to 2 decimals.
Confirm Order saves the order and deducts stock exactly once.
Print Receipt uses the browser’s print dialog.

Inventory

Add, edit, restock and delete ingredients, with search.
Status rules:
Out of Stock: quantity is 0.
Low Stock: quantity is above 0 and at or below the minimum.
In Stock: anything else.
Summary cards, stock distribution pie, low-stock alerts and recent stock updates.

Order History

Search by order ID, filter by date or status, and view full details.
Change status through Pending, Preparing and Completed.
Status changes never re-deduct stock or change totals.
Print a receipt for any saved order.

Sales Summary

Date-range filter, today’s sales, completed orders, revenue and average order value.
Daily sales chart, best-selling items and a sales-by-date table.
Printable report.

Settings

Café name, currency symbol, tax percentage and stock-alert notifications.
Reset Sample Data, with a confirmation prompt.
Business rules
Required ingredient quantity = ordered quantity × recipe quantity per serving.
Requirements for shared ingredients are added up across all order lines before stock is checked.
If any ingredient is short, the whole order is rejected and no stock changes.
Items in the cart do not touch stock. Stock is deducted only when an order is confirmed.
Double submission is prevented: the cart is cleared on confirmation and a busy flag blocks repeat clicks.
Items with no recipe can still be ordered. They are flagged, and no deduction is made for them.
Orders store their own item names, prices, tax rate and totals, so later menu, price or tax changes do not alter old orders.
Sales figures count Completed orders only. Totals include tax, and best-seller revenue excludes tax.
Ingredients use fixed units (g, ml, pcs, slices) with no automatic conversion.
An ingredient used in any recipe cannot be deleted until it is removed from those recipes.
Data storage

These localStorage keys are used:

Key	Contents
bt_menu	Menu items
bt_ingredients	Ingredients and stock levels
bt_recipes	Recipe lines per menu item
bt_orders	Saved orders
bt_stock_moves	Stock movement history
bt_settings	Café name, currency, tax rate, theme and order counter
Sample data is loaded only on the first launch, or if stored data is missing or unreadable. It is never reloaded on a normal refresh.
If stored JSON is corrupt, the app restores the sample data and shows a notice.
Clearing site data in the browser erases everything.
Sample data

The sample data is editable demonstration data, not real café sales or verified prices.

16 menu items, 18 ingredients (12 healthy, 4 low, 2 out of stock) and 21 sample orders over 7 days.
Lettuce and Butter are seeded as out of stock on purpose, so Paneer Wrap and Cheese Toast show the order-rejection behaviour.
Limitations
Single browser and single device only. There is no cloud sync and no multi-user access.
No login, user roles or server-side security.
No payment gateway or payment processing.
localStorage is not a database server: it has no transactions, concurrency control or large-capacity storage.
Recipe-based deduction is only as accurate as the recipes entered. Wastage is not tracked unless you adjust stock manually.
The app has not been tested in a real browser. Check printing and the phone layout yourself.
File structure
index.html   Page structure, sidebar, modal and receipt containers
style.css    Theme, layout, responsive rules and print styles
script.js    Storage, sample data, views, billing, inventory and printing logic
Future enhancements
Backend and database integration
Multi-user access with roles
Payment integration
Data export and import (JSON or CSV)
Weekly and monthly reports
