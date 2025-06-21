from rest_framework import serializers
from .models import Recipe, User, Favorite
from django.contrib.auth import authenticate


# PUBLIC_INTERFACE
class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""

    class Meta:
        model = User
        fields = ("id", "email", "username", "password")
        extra_kwargs = {
            "password": {"write_only": True, "min_length": 8},
        }

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


# PUBLIC_INTERFACE
class RecipeSerializer(serializers.ModelSerializer):
    """Serializer for Recipe model."""
    author = serializers.ReadOnlyField(source="author.username")
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = (
            "id", "author", "title", "description", "instructions", "ingredients",
            "image_url", "created_at", "updated_at", "is_favorited"
        )

    def get_is_favorited(self, obj):
        user = self.context.get("request").user
        if user.is_authenticated:
            return Favorite.objects.filter(user=user, recipe=obj).exists()
        return False


# PUBLIC_INTERFACE
class FavoriteSerializer(serializers.ModelSerializer):
    """Serializer for Favorite model."""
    recipe = RecipeSerializer(read_only=True)
    recipe_id = serializers.PrimaryKeyRelatedField(
        queryset=Recipe.objects.all(),
        write_only=True,
        source="recipe"
    )

    class Meta:
        model = Favorite
        fields = ("id", "user", "recipe", "recipe_id", "added_at")
        read_only_fields = ("user", "recipe", "added_at")


# PUBLIC_INTERFACE
class LoginSerializer(serializers.Serializer):
    """Serializer for login endpoint."""
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(email=data.get("email"), password=data.get("password"))
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        data["user"] = user
        return data
