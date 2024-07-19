# Football Manager

Football Manager is a web application for managing football matches, player statistics, and ELO ratings. It allows users to create, edit, and delete matches, manage players, and automatically calculate ELO ratings based on match results.

## Features

- Create, edit, and delete football matches
- Manage player information and statistics
- Automatic ELO rating calculations
- Track player payments for matches
- View match history and results

## Technologies Used

- Next.js
- React
- TypeScript
- Prisma (for database management)
- PostgreSQL (as the database)
- Tailwind CSS (for styling)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:

git clone https://github.com/yourusername/football-manager.git
cd football-manager

# ⚽ Football Manager

## 📌 Overview

Football Manager is a web application for organizing football matches, tracking player statistics, and managing ELO ratings. It provides an interface for match management, player tracking, and automated ELO calculations.

## 🌟 Key Features

- 🏟️ Match Management: Create, edit, and delete football matches
- 👥 Player Profiles: Maintain player information and statistics
- 🏆 ELO System: Automatic ELO rating calculations based on match outcomes
- 💰 Payment Tracking: Monitor player payments for matches
- 📊 Match History: View match results and statistics

## 🛠️ Tech Stack

- ⚛️ Next.js & React
- 🔷 TypeScript
- 🗃️ Prisma (ORM)
- 🐘 PostgreSQL
- 🎨 Tailwind CSS

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- PostgreSQL database

### Installation

1. 📥 Clone the repository:

   ```
   git clone https://github.com/yourusername/football-manager.git
   cd football-manager
   ```

2. 📦 Install dependencies:

   ```
   npm install
   ```

3. 🔑 Set up environment variables:
   Create a `.env` file in the root directory with your database URL:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/football_manager"
   ```

4. 🗄️ Set up the database:

   ```
   npx prisma migrate dev
   ```

5. 🖥️ Start the development server:

   ```
   npm run dev
   ```

6. 🌐 Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📘 Usage

- 🏟️ Create and manage matches from the Matches page
- 👥 Add and edit player information on the Players page
- 🏆 ELO ratings are automatically updated after each match
- 📊 View match history and player statistics in their respective sections

## 🤝 Contributing

Contributions are welcome. Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
