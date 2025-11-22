# YAP - Quick Start Guide

## ⚠️ Important Setup Steps

### Backend Setup

1. **Navigate to backend and activate venv:**
```bash
cd backend
venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Run migrations:**
```bash
python manage.py makemigrations
python manage.py migrate
```

4. **Create superuser:**
```bash
python create_superuser.py
```
Or manually: `python manage.py createsuperuser`

5. **Start server:**
```bash
python manage.py runserver
```

### Frontend Setup

1. **Navigate to frontend:**
```bash
cd frontend
```

2. **Install dependencies (if not done):**
```bash
npm install
npm install @tailwindcss/postcss
```

3. **Start dev server:**
```bash
npm run dev
```

## Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin
  - Username: `admin`
  - Password: `admin123`

## Test Flow

1. Register at `/register`
2. Approve user in Django admin
3. Login at `/login`
4. Explore Dashboard, Chat, Streaming

## Troubleshooting

### Backend: "No module named 'django'"
- Make sure venv is activated: `venv\Scripts\activate`
- Reinstall: `pip install -r requirements.txt`

### Frontend: Tailwind PostCSS error
- Install: `npm install @tailwindcss/postcss`
- Already fixed in `postcss.config.js`

### WebSocket Connection Failed
- Redis is optional for development
- Django Channels will use in-memory backend
