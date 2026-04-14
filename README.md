# 🏡 VeciGest - Comprehensive Community Management Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-Framework-20232A?logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-Platform-000020?logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Language-007ACC?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-BaaS-3ECF8E?logo=supabase&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**VeciGest** is a cross-platform application (Web, iOS, and Android) designed to modernize, bring transparency to, and streamline the management of homeowners' associations. It eliminates bureaucratic friction and improves coexistence through real-time communication tools, financial management, and remote democratic participation.

---

## ✨ Key Features

* **👥 Smart Role System:** Dynamically adapted interfaces and permissions for Administrators, Presidents, Vice Presidents, Secretaries, Treasurers, Neighbors, and Tenants.
* **💬 Real-Time Community Chat:** Instant and secure communication between neighbors using WebSockets, identifying users by their housing unit to protect phone number privacy.
* **📢 News & Announcements Board:** Management of official communications and community incidents with multimedia support (images) and a strict grid layout (Shrink-wrap).
* **🗳️ Meetings & Vote Delegation Module:** Interactive schedule of future meetings with a cryptographically secure system for transferring proxy votes between owners (combating absenteeism).
* **💶 Financial Control:** Tracking of community fees. Neighbors can view their pending receipts, while the board monitors the global debt and delinquency breakdown through a data aggregation engine.
* **📱 Universal Architecture (Responsive):** Native adaptive design. Utilizes a sidebar menu (*Drawer*) on mobile devices and a top navigation bar (*NavBar*) on desktop environments.

---

## 🛠️ Technologies & Architecture

### Frontend (User App & Admin Panel)
* **Framework:** React Native + Expo
* **Language:** TypeScript
* **Navigation:** React Navigation (Nested Drawer & Bottom Tabs)
* **State Management & UX:** Context API (`AuthProvider`), native animations (`Animated.spring`), and conditional rendering by platform.

### Backend as a Service (BaaS)
* **Platform:** Supabase
* **Database:** PostgreSQL with restrictive Row Level Security (RLS) policies.
* **Authentication:** Supabase Auth (JWT) with OTP password recovery flows.
* **Storage:** Supabase Storage (Buckets for news and announcement images).
* **Subscriptions:** Supabase Realtime (for chat and live updates of vote delegations).

---

## 🚀 Local Installation & Setup

Follow these steps to run the project in your local environment:

### 1. Clone the repository
```bash
git clone https://github.com/Afleco/VeciGest.git
cd VeciGest
```

### 2. Install dependencies
```bash
npm install
```
#### or
```bash
yarn install
```
### 3. Configure Environment Variables
Create a file named `.env` in the root of the project and add your Supabase credentials:
```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key_here
```

### 4. Start the development server
```bash
npx expo start
```
Press `w` to open the Web version.

Press `a` to open in an Android emulator.

Press `i` to open in an iOS simulator.

Scan the QR code with the Expo Go app to test it on your physical device.

### 📂 Project Structure

```bash
VeciGest/
├── app/                  # Main Expo Router directory
│   ├── (Screens)/        # Application screens (Home, Chat, News...)
│   ├── components/       # Reusable UI components (NewsCard, CustomPicker...)
│   ├── hooks/            # Custom hooks (e.g., useGlobalChat)
│   └── providers/        # Global contexts (AuthProvider)
├── lib/                  # External client configuration (Supabase)
├── styles/               # Centralized design system (Theme, Colors, Spacing)
└── assets/               # Static resources, fonts, and images
```

### 🧑‍💻 Authors
Developed as an Intermodular Project for CIFP Villa de Agüimes:

Lucas Alexandre Caso Rial

Alejandro Fleitas Correa

(Group 4)














