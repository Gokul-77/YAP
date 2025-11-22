@echo off
echo ========================================
echo YAP Backend - Starting Django Server
echo ========================================
echo.

cd backend
call venv\Scripts\activate

echo Installing Pillow (if needed)...
pip install Pillow --quiet

echo.
echo Running migrations...
python manage.py makemigrations
python manage.py migrate

echo.
echo Creating superuser (if needed)...
python create_superuser.py

echo.
echo ========================================
echo Starting Django server on http://localhost:8000
echo Admin panel: http://localhost:8000/admin
echo Username: admin
echo Password: admin123
echo ========================================
echo.

python manage.py runserver
