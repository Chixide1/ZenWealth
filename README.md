# ZenWealth

A comprehensive personal finance management application that provides insights on financial transactions and helps users create and manage budgets.

## Overview

ZenWealth is built with ASP.NET Core (backend) and TypeScript (frontend). The application enables users to:

- Track and visualize income vs expenses
- Connect to banking institutions via Plaid
- Manage multiple accounts (checking, savings, credit cards)
- Create and monitor budgets by category
- Analyze spending patterns through detailed analytics
- View transaction history with filtering capabilities
- Calculate net worth based on assets and liabilities

## Features

### Dashboard
The dashboard provides an overview of financial status including total balance, expenditure, savings, and income.
![Dashboard](.screenshots/Dashboard.png "Dashboard")

### Accounts
View and manage all connected financial accounts including bank accounts, credit cards, and savings accounts.
![Accounts](.screenshots/Accounts.png "Accounts")

### Transactions
Review transaction history with advanced filtering options by date, amount, account, and category.
![Transactions](.screenshots/Transactions.png "Transactions")

### Budgets
Create and manage monthly budgets by category with visual indicators of spending progress.
![Budgets](.screenshots/Budgets.png "Budgets")

### Analytics
Analyze spending patterns and income vs. expenses over time with detailed visualizations.
![Analytics](.screenshots/Analytics.png "Analytics")

### Settings
Manage connected banking institutions and account security settings.
![Settings](.screenshots/Settings.png "Settings")


## Technology Stack

- **Backend**: C# with ASP.NET Core & Going.Plaid
- **Frontend**: TypeScript with React, Shadcn & Tailwind CSS
- **Database**: SQL Server
- **External Services**: 
  - Plaid API for bank connections
  - Azure Communication Services for email notifications

## Prerequisites

- [.NET 8.0+](https://dotnet.microsoft.com/download)
- [Node.js 23.0+](https://nodejs.org/)
- [SQL Server](https://www.microsoft.com/en-gb/sql-server/sql-server-downloads)
- [A Plaid developer account](https://dashboard.plaid.com)
- [An Azure Account](https://azure.microsoft.com/en-gb/products/communication-services)

## Installation

1. Clone the repository
   ```
   git clone https://github.com/Chixide1/ZenWealth
   cd Zenwealth
   ```

2. Set up the backend
   ```
   cd Server
   dotnet restore
   ```

3. Set up the frontend
   ```
   cd Client
   npm install
   ```

4. Configure the application (see Configuration section below)

5. Run the application
   ```
   # In the Backend directory
   dotnet run
   
   # In a separate terminal, in the Frontend directory
   npm start
   ```

## Configuration

Copy the below json to `appsettings.json` and update the values:

```json
{
    "Logging": {
        "LogLevel": {
            "Default": "DEFAULT_LOG_LEVEL",
            "Microsoft.AspNetCore": "ASP.NET_CORE_LOG_LEVEL",
            "Microsoft.EntityFrameworkCore.Database.Command": "EF_CORE_LOG_LEVEL"
        }
    },
    "ConnectionStrings": {
        "DefaultConnection": "DATABASE_CONN_STR",
        "AzureCommunicationServices": "AZURE_COMMS_SERVICE_CONN_STR"
    },
    "AllowedHosts": "HOSTNAME",
    "Plaid": {
        "ClientID": "PLAID_CLIENT_ID",
        "Secret": "PLAID_SECRET",
        "WebhookUrl": "PLAID_WEBHOOK_URL"
    },
    "EmailSettings": {
        "SenderEmail": "AZURE_COMMS_SERVICE_SENDER_EMAIL",
        "FrontendBaseUrl": "FRONTEND_URL"
    }
}
```

### Configuration Values

- **Logging**:
  - `DEFAULT_LOG_LEVEL`: General logging level (e.g., "Information")
  - `ASP.NET_CORE_LOG_LEVEL`: Logging level for ASP.NET Core components (e.g., "Warning")
  - `EF_CORE_LOG_LEVEL`: Logging level for Entity Framework Core (e.g., "Information")

- **ConnectionStrings**:
  - `DefaultConnection`: Your database connection string
  - `AzureCommunicationServices`: Connection string for Azure Communication Services

- **AllowedHosts**: Hostname where the application will run (e.g., "localhost" or your domain)

- **Plaid**:
  - `ClientID`: Your Plaid client ID
  - `Secret`: Your Plaid secret
  - `WebhookUrl`: URL for Plaid webhooks (for transaction updates)

- **EmailSettings**:
  - `SenderEmail`: Email address used for sending notifications
  - `FrontendBaseUrl`: Base URL of your frontend application (for links in emails)
