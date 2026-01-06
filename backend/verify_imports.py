import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

print("Attempting to import PostImage from community.models...")
try:
    from community.models import PostImage
    print(f"Success: {PostImage}")
except ImportError as e:
    print(f"Failed to import PostImage: {e}")
except NameError as e:
    print(f"NameError importing PostImage: {e}")

print("Attempting to import community.views...")
try:
    from community import views
    print("Success importing views module")
except Exception as e:
    print(f"Failed to import views: {e}")
