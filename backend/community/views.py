from rest_framework import viewsets, permissions, status, filters
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Category, Post, Comment, Vote, PostImage, SavedPost
from .serializers import CategorySerializer, PostSerializer, CommentSerializer, VoteSerializer, PostImageSerializer, SavedPostSerializer

class IsAuthorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user or request.user.is_staff

class IsPostAuthor(permissions.BasePermission):
    """
    Permission for PostImage: checks if request.user is the author of the related Post.
    """
    def has_object_permission(self, request, view, obj):
        # obj is a PostImage instance
        return obj.post.author == request.user or request.user.is_staff

class IsFacultyOrAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow Faculty and Admins to create posts/categories.
    Students can only read.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Check if user is authenticated and has correct role
        if not request.user.is_authenticated:
            return False
            
        if request.user.role in ['ADMIN', 'FACULTY'] or request.user.is_staff:
            return True
            
        # For modifications (PUT, PATCH, DELETE), allow access so object-level permission (IsAuthorOrReadOnly) can handle it.
        # This allows a user to delete/edit their own post even if they are not currently Faculty (e.g. status changed).
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            return True
            
        return False

class IsCategoryOwnerOrAdmin(permissions.BasePermission):
    """
    Only allow owner or admin to delete category.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.is_staff or request.user.role == 'ADMIN':
            return True
        return obj.created_by == request.user


from django.db.models import Count

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.annotate(post_count=Count('posts')).order_by('-post_count')
    serializer_class = CategorySerializer
    permission_classes = [IsFacultyOrAdminOrReadOnly, IsCategoryOwnerOrAdmin]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [IsFacultyOrAdminOrReadOnly, IsAuthorOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'content', 'author__username']

    def get_queryset(self):
        queryset = Post.objects.all().order_by('-created_at')
        category_slug = self.request.query_params.get('category', None)
        author_id = self.request.query_params.get('author', None)

        if category_slug is not None:
            queryset = queryset.filter(category__slug=category_slug)
        if author_id is not None:
            queryset = queryset.filter(author__id=author_id)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def vote(self, request, pk=None):
        post = self.get_object()
        user = request.user
        value = request.data.get('value')
        
        if value not in [1, -1]:
            return Response({'error': 'Invalid vote value'}, status=status.HTTP_400_BAD_REQUEST)

        vote, created = Vote.objects.get_or_create(user=user, post=post, defaults={'value': value})
        
        if not created:
            if vote.value == value:
                vote.delete() # Toggle off if same vote
                return Response({'status': 'vote removed'})
            else:
                vote.value = value
                vote.save()
        
        return Response({'status': 'voted', 'value': value})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def save_post(self, request, pk=None):
        post = self.get_object()
        saved, created = SavedPost.objects.get_or_create(user=request.user, post=post)
        if not created:
            saved.delete()
            return Response({'status': 'unsaved', 'is_saved': False})
        return Response({'status': 'saved', 'is_saved': True})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def saved(self, request):
        saved_posts = SavedPost.objects.filter(user=request.user)
        page = self.paginate_queryset(saved_posts)
        if page is not None:
            serializer = SavedPostSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        serializer = SavedPostSerializer(saved_posts, many=True, context={'request': request})
        return Response(serializer.data)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]

    def get_queryset(self):
        queryset = Comment.objects.all().order_by('-created_at')
        post_id = self.request.query_params.get('post', None)
        author_id = self.request.query_params.get('author', None)
        
        if post_id is not None:
            queryset = queryset.filter(post__id=post_id)
        if author_id is not None:
            queryset = queryset.filter(author__id=author_id)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def vote(self, request, pk=None):
        comment = self.get_object()
        user = request.user
        value = request.data.get('value')
        
        if value not in [1, -1]:
            return Response({'error': 'Invalid vote value'}, status=status.HTTP_400_BAD_REQUEST)

        vote, created = Vote.objects.get_or_create(user=user, comment=comment, defaults={'value': value})
        
        if not created:
            if vote.value == value:
                vote.delete()
                return Response({'status': 'vote removed'})
            else:
                vote.value = value
                vote.save()
        
        return Response({'status': 'voted', 'value': value})

class PostImageViewSet(viewsets.ModelViewSet):
    queryset = PostImage.objects.all()
    serializer_class = PostImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsPostAuthor]
    http_method_names = ['get', 'delete', 'head', 'options'] # Only allow reading and deleting individually
