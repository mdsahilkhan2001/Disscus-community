from rest_framework import serializers
from .models import Category, Post, Comment, Vote, PostImage, SavedPost
from users.serializers import UserSerializer

class CategorySerializer(serializers.ModelSerializer):
    post_count = serializers.IntegerField(read_only=True)
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Category
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    
    user_vote = serializers.SerializerMethodField()
    vote_count = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ('id', 'post', 'author', 'content', 'parent', 'created_at', 'updated_at', 'vote_count', 'user_vote')
        read_only_fields = ('id', 'author', 'created_at', 'updated_at')

    def get_vote_count(self, obj):
        return obj.votes.filter(value=1).count() - obj.votes.filter(value=-1).count()

    def get_user_vote(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            vote = obj.votes.filter(user=request.user).first()
            if vote:
                return vote.value
        return 0

class PostImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = PostImage
        fields = ('id', 'image', 'created_at')

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category_detail = CategorySerializer(source='category', read_only=True)
    images = PostImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    user_vote = serializers.SerializerMethodField()
    vote_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ('id', 'author', 'category', 'category_detail', 'title', 'content', 'post_type', 
                  'image', 'images', 'uploaded_images', 'video', 'link_url', 'created_at', 'updated_at', 'vote_count', 'comment_count', 'user_vote', 'is_saved')
        read_only_fields = ('id', 'author', 'created_at', 'updated_at')

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        post = Post.objects.create(**validated_data)
        
        for image in uploaded_images:
            PostImage.objects.create(post=post, image=image)
            
        return post

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        # Update standard fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Add new images
        for image in uploaded_images:
            PostImage.objects.create(post=instance, image=image)
            
        return instance

    def get_vote_count(self, obj):
        return obj.votes.filter(value=1).count() - obj.votes.filter(value=-1).count()

    def get_user_vote(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            vote = obj.votes.filter(user=request.user).first()
            if vote:
                return vote.value
        return 0
    
    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedPost.objects.filter(user=request.user, post=obj).exists()
        return False

    video = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    def get_video(self, obj):
        if obj.video:
            return obj.video.url
        return None

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None

    def get_comment_count(self, obj):
        return obj.comments.count()

class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = '__all__'
        read_only_fields = ('id', 'user')

class SavedPostSerializer(serializers.ModelSerializer):
    post = PostSerializer(read_only=True)
    
    class Meta:
        model = SavedPost
        fields = ('id', 'user', 'post', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')
