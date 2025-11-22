# YAP - Yet Another Platform

A modern, lightweight, fully responsive real-time communication platform built using **React** (Frontend) and **Django** (Backend).

## Features

- 🔐 **Gmail-based Authentication** with admin approval workflow
- 👥 **Role-Based Access Control (RBAC)** - Admin, Staff, Paid, Free users
- 💬 **Real-Time Chat** - One-to-one and group messaging with WebSockets
- 📺 **Streaming Pages** - Paid/unpaid live streaming events
- 🌓 **Dark/Light Mode** - Full theme support
- 📱 **Fully Responsive** - Mobile, tablet, and desktop optimized
- 🎨 **Modern UI** - Built with Tailwind CSS and ShadCN components

## Tech Stack

### Backend
- Django 5.0
- Django REST Framework
- Django Channels (WebSockets)
- JWT Authentication
- PostgreSQL/SQLite

### Frontend
- React 18 with TypeScript
- Vite
- Tailwind CSS
- ShadCN UI Components
- Zustand (State Management)
- Axios

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Create superuser:
```bash
python create_superuser.py
# Or manually: python manage.py createsuperuser
```

6. Run the development server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

1. **Register** a new account at `/register`
2. Wait for **admin approval** (login to Django admin at `http://localhost:8000/admin`)
3. **Login** at `/login` after approval
4. Access **Dashboard**, **Chat**, and **Streaming** features

## Admin Panel

Access the Django admin panel at `http://localhost:8000/admin` to:
- Approve/reject user registrations
- Manage user roles (Admin, Staff, Paid, Free)
- Create and manage chat groups
- Create streaming events

## Project Structure

```
YAP/
├── backend/
│   ├── yap_project/        # Django project settings
│   ├── users/              # User authentication & RBAC
│   ├── chat/               # Real-time chat system
│   ├── streaming/          # Streaming events
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/          # React pages
    │   ├── store/          # Zustand stores
    │   ├── lib/            # Utilities & API client
    │   └── App.tsx
    └── package.json
```

## License

MIT
