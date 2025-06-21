from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, viewsets, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db import models

from .models import Recipe, Favorite
from .serializers import (
    UserSerializer, RecipeSerializer, FavoriteSerializer, LoginSerializer
)
from .permissions import IsOwnerOrReadOnly, IsSelfOrReadOnly

User = get_user_model()


@api_view(['GET'])
def health(request):
    return Response({"message": "Server is up!"})


# PUBLIC_INTERFACE
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """Register a new user."""
    serializer = UserSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        },
        status=status.HTTP_201_CREATED
    )


# PUBLIC_INTERFACE
@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """User login endpoint. Returns JWT token on success."""
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data["user"]
    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }
    )


# PUBLIC_INTERFACE
class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """User detail for authenticated user."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsSelfOrReadOnly]

    def get_object(self):
        return self.request.user


# PUBLIC_INTERFACE
class RecipeViewSet(viewsets.ModelViewSet):
    """
    Recipe CRUD, Search, and Listing.
    """
    serializer_class = RecipeSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        queryset = Recipe.objects.all().order_by('-created_at')
        query = self.request.query_params.get('q')
        if query:
            queryset = queryset.filter(
                models.Q(title__icontains=query)
                | models.Q(description__icontains=query)
                | models.Q(ingredients__icontains=query)
            )
        author = self.request.query_params.get('author')
        if author:
            queryset = queryset.filter(author__username=author)
        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


# PUBLIC_INTERFACE
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def favorite_list(request):
    """Get all recipes favorited by the current user."""
    favorites = Favorite.objects.filter(user=request.user).select_related('recipe')
    serializer = FavoriteSerializer(favorites, many=True)
    return Response(serializer.data)


# PUBLIC_INTERFACE
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def favorite_add(request):
    """Favorite/bookmark a recipe."""
    recipe_id = request.data.get("recipe_id")
    recipe = get_object_or_404(Recipe, id=recipe_id)
    Favorite.objects.get_or_create(user=request.user, recipe=recipe)
    return Response({"status": "added"}, status=status.HTTP_201_CREATED)


# PUBLIC_INTERFACE
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def favorite_remove(request, pk):
    """Remove a recipe from favorites."""
    recipe = get_object_or_404(Recipe, id=pk)
    Favorite.objects.filter(user=request.user, recipe=recipe).delete()
    return Response({"status": "removed"}, status=status.HTTP_204_NO_CONTENT)
