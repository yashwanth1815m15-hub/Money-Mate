================================================================================
3. PLAN FOR COLLECTING / USING DATA
================================================================================

3.1 Types of Data Collected
----------------------------

User Account Data:
• Email address (for authentication)
• Username (display name: "Yashwanth")
• Password (encrypted/hashed)
• Profile information

Budget and Financial Data:
• Monthly budget amount (₹500000.00 as shown)
• Total spent amount (₹2100.00)
• Savings amount (₹497900.00)
• Owed/owing balances (₹-500.00)

Expense Transaction Data:
• Expense name/description (e.g., "Netflix", "Food", "food")
• Amount (₹800.00, ₹900.00, ₹400.00)
• Date of transaction (Dec 8, 2025, Dec 9, 2025)
• Category (Other, Health, Food & Dining)
• Type (Personal vs Group)
• Tags/labels for classification

Group Expense Data:
• Group membership information
• Individual shares in group expenses
• Settlement status
• Split calculations

Recurring Expense Data:
• Recurring expense definitions
• Frequency (monthly, weekly, etc.)
• Auto-generation settings

3.2 How Data is Created, Stored, Updated, and Used
---------------------------------------------------

Data Creation:
• Users manually input expenses through "Add Expense" button
• Budget settings configured in Budget Settings page
• Recurring expenses set up through dedicated interface
• Group expenses created and shared with group members

Data Storage:
• Relational database (MySQL/PostgreSQL) stores all structured data
• User authentication tokens stored securely
• Session data maintained for active users
• Historical transaction data preserved for analysis

Data Updates:
• Real-time updates when expenses are added/modified
• Automatic calculation of totals and savings
• Monthly budget reset functionality
• Group expense settlement updates

Data Usage:
• Dashboard displays aggregated financial summary
• Recent Activity panel shows chronological transactions
• Monthly Overview calculates budget utilization percentage (0.4%)
• Personal vs Group breakdown for expense categorization
• AI Insights section analyzes spending patterns
• Category-wise budget tracking

3.3 Data Validation and Accuracy Assumptions
---------------------------------------------

Input Validation:
• Amount fields accept only positive numerical values
• Date fields validated for proper format and range
• Category selection from predefined list
• Email format validation during registration
• Mandatory field checks before submission

Calculation Accuracy:
• Savings = Monthly Budget - Total Spent
• Budget Used % = (Total Spent / Monthly Budget) × 100
• Group expense splits calculated based on member count
• Owed amounts tracked with proper debit/credit logic

Assumptions:
• Users enter accurate expense information
• Dates are within reasonable range (not future-dated beyond current date)
• Currency is consistently in INR (₹)
• One expense entry represents one transaction
• Budget period is calendar month-based

3.4 Privacy and Basic Security Considerations
----------------------------------------------

Authentication & Authorization:
• Password-based authentication system
• Session management for logged-in users
• User can only access their own data
• Group data visible only to group members

Data Privacy:
• Personal expenses visible only to the user
• Group expenses shared only within group
• No public exposure of financial information
• User email not displayed publicly (partial shown: yashwanth1815.m15@gm...)

Security Measures:
• Password hashing (bcrypt or similar)
• HTTPS for data transmission (in production)
• SQL injection prevention through parameterized queries
• XSS protection in frontend
• CSRF token implementation for forms
• Session timeout after inactivity

Data Integrity:
• Database constraints (NOT NULL, foreign keys)
• Transaction rollback on error
• Regular backup considerations
• Audit trail for critical operations