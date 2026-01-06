import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

username = "sahil_test"
email = "sahil@email.com"
password = "Admin@123"

try:
    if User.objects.filter(email=email).exists():
        print(f"User with email {email} already exists.")
        u = User.objects.get(email=email)
        u.set_password(password)
        u.save()
        print("Password updated to Admin@123")
    else:
        User.objects.create_user(username=username, email=email, password=password, role='STUDENT')
        print(f"Created user {username} with email {email}")
except Exception as e:
    print(f"Error: {e}")
