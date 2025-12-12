================================================================================
4. DESIGN DOCUMENTS
================================================================================

4.1 System Architecture
-----------------------

Three-Tier Architecture:

PRESENTATION LAYER (Frontend):
• Technology: React.js or similar modern JavaScript framework
• Responsive web interface
• Component-based UI (Dashboard, Expense Forms, Budget Settings, etc.)
• State management for real-time updates
• Client-side validation
• RESTful API consumption

APPLICATION LAYER (Backend):
• Technology: Node.js with Express.js / Python with Django/Flask
• RESTful API endpoints for CRUD operations
• Business logic implementation
• Authentication and authorization middleware
• Data validation and sanitization
• Session management
• Error handling and logging

DATA LAYER (Database):
• Technology: MySQL or PostgreSQL
• Relational database structure
• User authentication tables
• Transaction and expense tables
• Budget and category tables
• Group management tables
• Indexing on frequently queried fields

Additional Components:
• Static File Server: For CSS, JavaScript, images
• Session Store: Redis or in-memory for session data
• Environment Configuration: Separate dev/production configs

Architecture Flow:
1. User interacts with web interface (browser)
2. Frontend sends HTTP requests to backend API
3. Backend processes request, applies business logic
4. Backend queries/updates database
5. Database returns data to backend
6. Backend sends JSON response to frontend
7. Frontend updates UI dynamically

4.2 High-Level Design (Modules and Responsibilities)
----------------------------------------------------

MODULE 1: User Authentication Module
Responsibilities:
• User registration (email, password, name)
• User login with credential verification
• Session creation and management
• Logout functionality
• Password reset mechanism
Components: Login page, Register page, Auth API, Session manager

MODULE 2: Dashboard Module
Responsibilities:
• Display summary cards (Budget, Spent, Savings, Owed)
• Show recent activity list
• Render monthly overview with progress
• Category-wise spending breakdown
Components: Dashboard page, Summary cards, Activity feed, Overview charts

MODULE 3: Expense Management Module
Responsibilities:
• Add new expense (personal/group)
• Edit existing expense
• Delete expense
• Categorize expenses
• Filter and search expenses
Components: Add Expense form, Expense list, Edit modal, Delete confirmation

MODULE 4: Budget Management Module
Responsibilities:
• Set monthly budget amount
• Define category-wise budgets
• Track budget utilization
• Send alerts on budget threshold
Components: Budget Settings page, Budget API, Alert service

MODULE 5: Recurring Expenses Module
Responsibilities:
• Define recurring expense templates
• Automatic expense generation
• Manage recurrence schedule
• Edit/delete recurring entries
Components: Recurring Expenses page, Scheduler service

MODULE 6: Group Expenses Module
Responsibilities:
• Create groups
• Add members to groups
• Record group expenses
• Calculate individual shares
• Track settlements
• Show who owes whom
Components: Groups page, Add Group form, Group detail view, Settlement tracker

MODULE 7: Category Management Module
Responsibilities:
• Predefine expense categories (Food, Health, Other, etc.)
• Allow custom category creation
• Assign categories to expenses
Components: Category Settings page, Category selector

MODULE 8: Savings and Balance Module
Responsibilities:
• Calculate savings (Budget - Spent)
• Track money owed to/from others
• Display balance summary
Components: Savings display, Owed balance card

MODULE 9: AI Insights Module
Responsibilities:
• Analyze spending patterns
• Provide spending recommendations
• Identify unusual expenses
• Suggest budget optimizations
Components: AI Insights page, Analysis algorithms

MODULE 10: Reporting and Analytics Module
Responsibilities:
• Generate monthly/yearly reports
• Visualize spending trends
• Export data (CSV/PDF)
Components: Reports page, Charts library, Export service

MODULE 11: Notification Module
Responsibilities:
• Send budget alerts
• Notify about group settlements
• Remind about recurring expenses
Components: Notifications page, Alert service

4.3 UI/Wireframe Description (Based on Dashboard Screenshot)
------------------------------------------------------------

Layout Structure:

LEFT SIDEBAR (Navigation Panel):
• Logo and brand name "Money-Mate" with tagline "Your finance companion"
• Navigation menu items (vertically stacked):
  - Dashboard (house icon)
  - Personal Expenses (wallet icon)
  - Groups (people icon)
  - Recurring Expenses (refresh icon)
  - Budget Settings (gear icon)
  - Category Budgets (chart icon)
  - Savings Goals (target icon)
  - AI Insights (sparkle icon)
  - Category Settings (tag icon)
  - Notifications (bell icon)
• User profile section at bottom:
  - Avatar with initial "Y"
  - Name "Yashwanth"
  - Email (truncated)
  - Logout button

MAIN CONTENT AREA:

Header Section:
• Welcome message: "Welcome back, Yashwanth!"
• Subtitle: "Track your expenses and manage your budget"
• "Add Expense" button (purple, top-right corner)

Summary Cards Row (4 cards):
1. Monthly Budget: ₹500000.00 (purple icon)
2. Total Spent: ₹2100.00 (blue icon)
3. Savings: ₹497900.00 (green icon)
4. You Are Owed: ₹-500.00 (teal icon - negative indicates user owes)

Content Panels (Two columns):

Left Panel - Recent Activity:
• Header with calendar icon and "Recent Activity" title
• List of recent transactions:
  - Expense name (bold)
  - Category tags (colored pills: "Other", "Health", "Food & Dining")
  - Type tag ("Personal")
  - Date with calendar icon
  - Amount (right-aligned, purple text)

Right Panel - Monthly Overview:
• Header with pie chart icon and "Monthly Overview" title
• Budget Used section:
  - Percentage: 0.4%
  - Progress bar (minimal fill, purple color)
  - Text: "₹2100.00 of ₹500000.00"
• Spending breakdown:
  - Personal expenses: ₹2100.00 (with wallet icon)
  - Group expenses: ₹0.00 (with people icon)
  - Savings: ₹497900.00 (green text, large)

Color Scheme:
• Primary: Purple (#7C3AED or similar)
• Accent colors: Blue, Green, Teal
• Background: Light gray/white
• Text: Dark gray/black
• Cards: White with subtle shadows

Typography:
• Large bold text for amounts
• Medium weight for labels
• Regular weight for descriptions
• Clear hierarchy

4.4 Database Schema
-------------------

TABLE 1: users
--------------
user_id (Primary Key, INT, Auto Increment)
email (VARCHAR(255), UNIQUE, NOT NULL)
password_hash (VARCHAR(255), NOT NULL)
username (VARCHAR(100), NOT NULL)
created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
updated_at (TIMESTAMP, ON UPDATE CURRENT_TIMESTAMP)

TABLE 2: budgets
----------------
budget_id (Primary Key, INT, Auto Increment)
user_id (Foreign Key -> users.user_id, INT, NOT NULL)
month (DATE, NOT NULL) [stores as YYYY-MM-01]
monthly_budget (DECIMAL(15,2), NOT NULL)
created_at (TIMESTAMP)
UNIQUE(user_id, month)

TABLE 3: categories
-------------------
category_id (Primary Key, INT, Auto Increment)
category_name (VARCHAR(100), NOT NULL)
category_type (VARCHAR(50)) [e.g., "Food & Dining", "Health", "Other"]
is_default (BOOLEAN, DEFAULT FALSE)
created_at (TIMESTAMP)

TABLE 4: expenses
-----------------
expense_id (Primary Key, INT, Auto Increment)
user_id (Foreign Key -> users.user_id, INT, NOT NULL)
expense_name (VARCHAR(255), NOT NULL)
amount (DECIMAL(15,2), NOT NULL)
expense_date (DATE, NOT NULL)
category_id (Foreign Key -> categories.category_id, INT)
expense_type (ENUM('personal', 'group'), NOT NULL)
group_id (Foreign Key -> groups.group_id, INT, NULL)
description (TEXT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)

TABLE 5: groups
---------------
group_id (Primary Key, INT, Auto Increment)
group_name (VARCHAR(100), NOT NULL)
created_by (Foreign Key -> users.user_id, INT, NOT NULL)
created_at (TIMESTAMP)

TABLE 6: group_members
----------------------
membership_id (Primary Key, INT, Auto Increment)
group_id (Foreign Key -> groups.group_id, INT, NOT NULL)
user_id (Foreign Key -> users.user_id, INT, NOT NULL)
joined_at (TIMESTAMP)
UNIQUE(group_id, user_id)

TABLE 7: group_expense_splits
------------------------------
split_id (Primary Key, INT, Auto Increment)
expense_id (Foreign Key -> expenses.expense_id, INT, NOT NULL)
user_id (Foreign Key -> users.user_id, INT, NOT NULL)
share_amount (DECIMAL(15,2), NOT NULL)
settled (BOOLEAN, DEFAULT FALSE)
settled_at (TIMESTAMP, NULL)

TABLE 8: recurring_expenses
----------------------------
recurring_id (Primary Key, INT, Auto Increment)
user_id (Foreign Key -> users.user_id, INT, NOT NULL)
expense_name (VARCHAR(255), NOT NULL)
amount (DECIMAL(15,2), NOT NULL)
category_id (Foreign Key -> categories.category_id, INT)
frequency (ENUM('daily', 'weekly', 'monthly', 'yearly'), NOT NULL)
start_date (DATE, NOT NULL)
end_date (DATE, NULL)
next_occurrence (DATE, NOT NULL)
active (BOOLEAN, DEFAULT TRUE)
created_at (TIMESTAMP)

TABLE 9: savings_goals
----------------------
goal_id (Primary Key, INT, Auto Increment)
user_id (Foreign Key -> users.user_id, INT, NOT NULL)
goal_name (VARCHAR(255), NOT NULL)
target_amount (DECIMAL(15,2), NOT NULL)
current_amount (DECIMAL(15,2), DEFAULT 0)
target_date (DATE)
created_at (TIMESTAMP)

TABLE 10: category_budgets
---------------------------
category_budget_id (Primary Key, INT, Auto Increment)
user_id (Foreign Key -> users.user_id, INT, NOT NULL)
category_id (Foreign Key -> categories.category_id, INT, NOT NULL)
month (DATE, NOT NULL)
budget_amount (DECIMAL(15,2), NOT NULL)
UNIQUE(user_id, category_id, month)

Relationships:
• One user has many budgets (1:N)
• One user has many expenses (1:N)
• One user can create many groups (1:N)
• Many users belong to many groups (N:M through group_members)
• One expense belongs to one category (N:1)
• One group expense has many splits (1:N)
• One user has many recurring expenses (1:N)
• One user has many savings goals (1:N)

Indexes for Performance:
• user_id in all related tables
• expense_date in expenses table
• (user_id, month) in budgets table
• (group_id, user_id) in group_members table