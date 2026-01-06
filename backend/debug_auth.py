import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import authenticate, get_user_model

User = get_user_model()

print("--- Authentication Debug Script ---")

try:
    users = User.objects.all()
    print(f"Total Users: {users.count()}")
    for u in users:
        print(f" - {u.username} | {u.email} | Active: {u.is_active}")

    print("\nTesting 'bitu' login:")
    user_bitu = authenticate(username='bitu', password='Admin@123')
    if user_bitu:
        print(" [SUCCESS] Authenticated 'bitu' via Username.")
    else:
        print(" [FAILED] Could not authenticate 'bitu' via Username.")

    print("\nTesting 'sahil@email.com' (if exists) login:")
    # Assuming the user meant sahil from the screenshot context, checking any user with that email
    try:
        user_sahil = User.objects.get(email='sahil@email.com')
        # Assuming pass is same or we test generic
    except User.DoesNotExist:
        user_sahil = None
        print(" [INFO] No user with sahil@email.com found.")

except Exception as e:
    print(f"Error: {e}")
