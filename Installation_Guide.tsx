================================================================================
7. INSTALLATION GUIDE AND USER GUIDE
================================================================================

7.1 Installation Guide (Website Access)
----------------------------------------

OPTION 1: Access Live Website (Recommended for Users)

Prerequisites:
• Modern web browser (Google Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
• Stable internet connection
• JavaScript enabled in browser

Steps:
1. Open your web browser
2. Navigate to the Money-Mate website URL (provided by project team)
3. You will see the login/registration page
4. Create a new account or log in with existing credentials
5. Start using Money-Mate immediately

No installation required - This is a web-based application accessible from 
any device with a browser.

OPTION 2: Local Development Setup (For Developers/Reviewers)

Prerequisites:
• Node.js (v16 or higher) installed
• npm or yarn package manager
• MySQL or PostgreSQL database
• Git for cloning repository
• Code editor (VS Code recommended)

Backend Setup:

1. Clone the repository:
   git clone https://github.com/yourusername/money-mate.git
   cd money-mate/backend

2. Install dependencies:
   npm install

3. Configure environment variables:
   Create a .env file in backend folder with:
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=moneymate_db
   DB_USER=your_db_username
   DB_PASSWORD=your_db_password
   JWT_SECRET=your_secret_key
   PORT=5000

4. Setup database:
   Create database: CREATE DATABASE moneymate_db;
   Run migrations: npm run migrate
   Seed default categories: npm run seed

5. Start backend server:
   npm run dev
   Server runs on http://localhost:5000

Frontend Setup:

1. Navigate to frontend folder:
   cd ../frontend

2. Install dependencies:
   npm install

3. Configure API endpoint:
   Create .env file in frontend folder
   Add: REACT_APP_API_URL=http://localhost:5000/api

4. Start frontend development server:
   npm start
   Application opens at http://localhost:3000

Verify Installation:
• Open browser to http://localhost:3000
• You should see the Money-Mate login page
• Register a test account
• If dashboard loads successfully, installation is complete

Troubleshooting:
• Port already in use: Change PORT in .env file
• Database connection error: Check DB credentials in .env
• Module not found: Run npm install again
• CORS errors: Ensure backend CORS is configured for frontend URL

7.2 User Guide
--------------

GETTING STARTED

1. Creating an Account
• Click on "Register" or "Sign Up" link on the homepage
• Enter your email address
• Create a strong password (minimum 8 characters)
• Enter your name
• Click "Register" button
• You will be automatically logged in to your dashboard

2. Logging In
• Enter your registered email address
• Enter your password
• Click "Login" button
• You will be redirected to the dashboard

3. Understanding the Dashboard
The dashboard is your main hub showing:
• Monthly Budget: Total budget set for the current month
• Total Spent: Sum of all expenses this month
• Savings: Remaining budget (Budget - Spent)
• You Are Owed: Net amount owed in group expenses
  (Negative means you owe others, Positive means others owe you)

MANAGING YOUR BUDGET

Setting a Monthly Budget:
1. Click on "Budget Settings" in the left sidebar
2. Enter your desired monthly budget amount
3. Click "Save Budget"
4. Your dashboard will update automatically

The system calculates:
• Savings automatically (Budget - Total Spent)
• Budget utilization percentage in Monthly Overview
• Alerts when you approach budget limit

ADDING EXPENSES

Personal Expense:
1. Click the "+ Add Expense" button (top-right corner)
2. Fill in the expense details:
   • Expense Name (e.g., "Grocery Shopping")
   • Amount (in ₹)
   • Date (defaults to today)
   • Category (select from dropdown)
3. Ensure "Personal" is selected as expense type
4. Click "Add Expense"
5. The expense appears in Recent Activity immediately
6. Dashboard totals update automatically

Group Expense:
1. Click "+ Add Expense" button
2. Fill in expense details
3. Select "Group" as expense type
4. Choose the group from dropdown
5. The expense will be split among group members
6. Click "Add Expense"

VIEWING AND MANAGING EXPENSES

Recent Activity Panel:
• Shows your most recent transactions
• Each entry displays:
  - Expense name
  - Category tags (colored)
  - Type (Personal/Group)
  - Date
  - Amount
• Click on any expense to view details or edit

Personal Expenses Page:
1. Click "Personal Expenses" in sidebar
2. View complete list of your personal expenses
3. Filter by:
   • Date range
   • Category
   • Amount range
4. Search for specific expenses
5. Edit expense: Click expense → Modify → Save
6. Delete expense: Click expense → Delete → Confirm

WORKING WITH GROUPS

Creating a Group:
1. Click "Groups" in the left sidebar
2. Click "Create New Group" button
3. Enter group name (e.g., "Roommates", "Trip to Goa")
4. Add member email addresses
5. Click "Create Group"
6. Members receive notification to join

Adding Group Expenses:
1. Use "+ Add Expense" and select group type
2. OR go to specific group page
3. Click "Add Group Expense"
4. Enter expense details
5. System automatically calculates split
6. Each member sees their share

Settling Balances:
1. Go to Groups page
2. Select the group
3. View "Balances" section showing who owes whom
4. Click "Settle Up" next to a balance
5. Mark as settled after payment
6. Balance updates immediately

RECURRING EXPENSES

Setting Up Recurring Expense:
1. Click "Recurring Expenses" in sidebar
2. Click "Add Recurring Expense"
3. Fill in details:
   • Expense name (e.g., "Netflix Subscription")
   • Amount
   • Category
   • Frequency (Daily/Weekly/Monthly/Yearly)
   • Start date
   • End date (optional)
4. Click "Save"
5. System auto-generates expenses based on schedule

Managing Recurring Expenses:
• View all recurring expenses in list
• Edit: Change amount, frequency, or category
• Pause: Temporarily stop auto-generation
• Delete: Remove recurring expense permanently
• View history: See all generated expenses

CATEGORY MANAGEMENT

Using Default Categories:
• Food & Dining
• Health
• Transportation
• Entertainment
• Shopping
• Bills & Utilities
• Other

Creating Custom Categories:
1. Go to "Category Settings"
2. Click "Add New Category"
3. Enter category name
4. Choose category color
5. Click "Save"
6. New category available in expense forms

Category Budgets:
1. Click "Category Budgets" in sidebar
2. Set budget for each category
3. Track spending per category
4. Receive alerts when category budget exceeded

SAVINGS GOALS

Creating a Savings Goal:
1. Click "Savings Goals" in sidebar
2. Click "Add New Goal"
3. Enter goal details:
   • Goal name (e.g., "New Laptop")
   • Target amount
   • Target date
4. Click "Create Goal"

Tracking Progress:
• View progress bar for each goal
• Add money to goal from savings
• System shows percentage completed
• Receive notification when goal achieved

AI INSIGHTS

Accessing Insights:
1. Click "AI Insights" in sidebar
2. View automated analysis of your spending

Insights Provided:
• Spending patterns and trends
• Unusual expenses detection
• Category-wise breakdown
• Recommendations for budget optimization
• Comparison with previous months
• Predictions for upcoming expenses

NOTIFICATIONS

Managing Notifications:
1. Click "Notifications" icon in sidebar
2. View all notifications:
   • Budget threshold alerts
   • Group expense updates
   • Settlement reminders
   • Recurring expense generated
   • Savings goal milestones

3. Mark as read or dismiss
4. Configure notification preferences in settings

MONTHLY OVERVIEW

Understanding Your Overview:
• Budget Used: Percentage of monthly budget spent
• Progress bar: Visual representation
• Personal vs Group: Breakdown of expense types
• Savings: Displayed prominently in green

The overview updates in real-time as you add expenses.

TIPS FOR EFFECTIVE USE

1. Regular Updates:
   • Add expenses as soon as they occur
   • Don't wait until end of month
   • Use mobile browser for on-the-go entry

2. Proper Categorization:
   • Assign correct category to each expense
   • Create custom categories for specific needs
   • Use categories consistently

3. Budget Management:
   • Set realistic monthly budgets
   • Review and adjust quarterly
   • Use category budgets for better control

4. Group Expenses:
   • Add group expenses promptly
   • Settle balances regularly
   • Communicate with group members

5. Use Recurring Expenses:
   • Set up all subscriptions and regular bills
   • Review recurring expenses monthly
   • Update amounts when they change

6. Review Insights:
   • Check AI Insights weekly
   • Act on recommendations
   • Identify spending patterns
   • Adjust budget based on insights

ACCOUNT SETTINGS

Updating Profile:
1. Click on your name at bottom of sidebar
2. Select "Profile Settings"
3. Update name, email, or password
4. Click "Save Changes"

Changing Password:
1. Go to Profile Settings
2. Click "Change Password"
3. Enter current password
4. Enter new password
5. Confirm new password
6. Click "Update Password"

Logging Out:
1. Click "Logout" button at bottom of sidebar
2. You will be logged out and redirected to login page
3. Your session ends immediately

DATA EXPORT

Exporting Your Data:
1. Go to "Reports" or "Settings"
2. Select "Export Data"
3. Choose format (CSV or PDF)
4. Select date range
5. Click "Download"
6. File downloads to your computer

TROUBLESHOOTING

Common Issues and Solutions:

1. Expense not showing in Recent Activity:
   • Refresh the page
   • Check if date is correct
   • Verify expense was saved successfully

2. Budget calculation incorrect:
   • Ensure all expenses are categorized
   • Check for duplicate entries
   • Verify monthly budget amount

3. Cannot add group expense:
   • Ensure you're a member of the group
   • Check if group still exists
   • Verify internet connection

4. Login issues:
   • Verify email and password are correct
   • Check caps lock key
   • Use "Forgot Password" if needed
   • Clear browser cache

5. Dashboard not updating:
   • Refresh the page
   • Clear browser cache
   • Check internet connection
   • Try a different browser

SUPPORT AND FEEDBACK

Getting Help:
• Check this user guide first
• Visit FAQ section (if available)
• Contact project team via provided email
• Report bugs through feedback form

Providing Feedback:
• Click feedback icon (if available)
• Email suggestions to project team
• Report bugs with screenshots
• Suggest new features

PRIVACY AND SECURITY

Your Data Security:
• All passwords are encrypted
• Personal expenses are private
• Group data shared only with members
• HTTPS encryption for data transmission
• Regular security updates

Best Practices:
• Use strong, unique password
• Don't share your login credentials
• Log out from shared devices
• Review account activity regularly
• Report suspicious activity immediately

CONCLUSION

Money-Mate helps you:
✓ Track personal expenses effortlessly
✓ Manage monthly budgets effectively
✓ Handle group expenses fairly
✓ Set and achieve savings goals
✓ Gain insights into spending patterns
✓ Make informed financial decisions

For the best experience:
• Update expenses regularly
• Review your dashboard daily
• Use categories consistently
• Set realistic budgets
• Act on AI insights
• Settle group balances promptly