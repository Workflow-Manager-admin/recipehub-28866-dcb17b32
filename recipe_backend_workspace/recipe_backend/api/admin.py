from django.contrib import admin
from .models import User, Recipe, Favorite


# PUBLIC_INTERFACE
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "is_active", "is_staff")
    search_fields = ("email", "username")
    readonly_fields = ("last_login", "date_joined")


# PUBLIC_INTERFACE
@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "author", "created_at")
    search_fields = ("title", "author__email")
    list_filter = ("created_at",)


# PUBLIC_INTERFACE
@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "recipe", "added_at")
    search_fields = ("user__email", "recipe__title")
    list_filter = ("added_at",)
