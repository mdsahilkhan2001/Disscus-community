from community.models import Category

categories = [
    {'name': 'General', 'slug': 'general', 'description': 'General discussion'},
    {'name': 'CSE Department', 'slug': 'cse', 'description': 'Computer Science & Engineering'},
    {'name': 'ECE Department', 'slug': 'ece', 'description': 'Electronics & Communication'},
    {'name': 'Events', 'slug': 'events', 'description': 'Campus Events and Updates'},
    {'name': 'Research', 'slug': 'research', 'description': 'Research Opportunities and Papers'},
]

for cat_data in categories:
    Category.objects.get_or_create(
        slug=cat_data['slug'],
        defaults=cat_data
    )
    print(f"Ensured category: {cat_data['name']}")
