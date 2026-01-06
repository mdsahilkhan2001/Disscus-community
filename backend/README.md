# T.I.M.E. Community Backend

This is the Django REST Framework backend for the T.I.M.E. Community Platform.

## Requirements
- Python 3.8+
- Django 4.x
- Django REST Framework

## Setup

1.  **Install Dependencies**
    ```bash
    pip install django djangorestframework django-cors-headers
    ```

2.  **Run Migrations**
    ```bash
    python manage.py migrate
    ```

3.  **Create Superuser** (Optional, for admin access)
    ```bash
    python manage.py createsuperuser
    ```

4.  **Run Server**
    ```bash
    python manage.py runserver
    ```

The API will be available at `http://127.0.0.1:8000/`.

## Key Endpoints
- Admin: `/admin/`
- API Root: `/api/`
- Auth: `/api/users/login/`, `/api/users/register/`
- Community: `/api/community/posts/`, `/api/community/categories/`
