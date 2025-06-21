from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    health,
    register,
    login,
    UserDetailView,
    RecipeViewSet,
    favorite_list,
    favorite_add,
    favorite_remove,
)

router = DefaultRouter()
router.register(r"recipes", RecipeViewSet, basename="recipe")

urlpatterns = [
    path('health/', health, name='Health'),
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('me/', UserDetailView.as_view(), name='me'),
    path('favorites/', favorite_list, name='favorite-list'),
    path('favorites/add/', favorite_add, name='favorite-add'),
    path('favorites/remove/<int:pk>/', favorite_remove, name='favorite-remove'),
    path('', include(router.urls)),
]
