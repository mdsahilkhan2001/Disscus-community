from django.core.management.base import BaseCommand
from community.models import Category

class Command(BaseCommand):
    help = 'Populates initial categories'

    def handle(self, *args, **kwargs):
        categories = [
            {'name': 'General', 'slug': 'general', 'description': 'General discussion'},
            {'name': 'CSE Department', 'slug': 'cse', 'description': 'Computer Science & Engineering'},
            {'name': 'ECE Department', 'slug': 'ece', 'description': 'Electronics & Communication'},
            {'name': 'Events', 'slug': 'events', 'description': 'Campus Events and Updates'},
            {'name': 'Research', 'slug': 'research', 'description': 'Research Opportunities and Papers'},
        ]

        for cat_data in categories:
            cat, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created category: {cat_data['name']}"))
            else:
                self.stdout.write(f"Category already exists: {cat_data['name']}")
