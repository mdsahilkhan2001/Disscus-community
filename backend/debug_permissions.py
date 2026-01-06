import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from community.views import PostViewSet
from community.models import Post, Category
from users.models import User

def test_permissions():
    factory = APIRequestFactory()
    view = PostViewSet.as_view({'put': 'update'})

    # 1. Create Faculty User
    faculty_user, _ = User.objects.get_or_create(username='faculty_debug', email='faculty@debug.com', defaults={'role': 'FACULTY'})
    faculty_user.set_password('password')
    faculty_user.save()

    # 2. Create Category
    category, _ = Category.objects.get_or_create(name='Debug Cat', slug='debug-cat')

    # 3. Create Post by Faculty
    post = Post.objects.create(title='Faculty Post', content='Content', author=faculty_user, category=category)

    # 4. Attempt to Edit as Faculty (Author)
    print(f"Testing Edit by Author (Faculty): {faculty_user.username}")
    request = factory.put(f'/api/community/posts/{post.id}/', {'title': 'Updated Title', 'content': 'Updated Content', 'category': category.id})
    force_authenticate(request, user=faculty_user)
    response = view(request, pk=post.id)
    print(f"Response: {response.status_code}")
    if response.status_code == 200:
        print("SUCCESS: Faculty author can edit.")
    else:
        print(f"FAILURE: {response.data}")

    # 5. Attempt to Edit as Student (Not Author)
    student_user, _ = User.objects.get_or_create(username='student_debug', email='student@debug.com', defaults={'role': 'STUDENT'})
    print(f"\nTesting Edit by Student (Non-Author): {student_user.username}")
    request = factory.put(f'/api/community/posts/{post.id}/', {'title': 'Hacked Title', 'content': 'Hacked Content', 'category': category.id})
    force_authenticate(request, user=student_user)
    response = view(request, pk=post.id)
    print(f"Response: {response.status_code}")
    if response.status_code == 403: # Expect 403 Forbidden
        print("SUCCESS: Student cannot edit.")
    else:
         print(f"FAILURE: Unexpected status {response.status_code}")

if __name__ == '__main__':
    test_permissions()
