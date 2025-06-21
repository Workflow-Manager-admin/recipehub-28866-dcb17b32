from django.db import models
from django.contrib.auth.models import AbstractUser


# PUBLIC_INTERFACE
class User(AbstractUser):
    """
    Custom user model for the Recipe app.
    """
    # Email is UNIQUE (for auth)
    email = models.EmailField(unique=True)
    # Optionally add more fields here in the future

    REQUIRED_FIELDS = ["username"]
    USERNAME_FIELD = "email"

    def __str__(self):
        return self.email


# PUBLIC_INTERFACE
class Recipe(models.Model):
    """
    Recipe model representing a recipe entry.
    """
    author = models.ForeignKey('User', related_name='recipes', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    instructions = models.TextField()
    ingredients = models.TextField(help_text="Separate ingredients by newline")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    image_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.title


# PUBLIC_INTERFACE
class Favorite(models.Model):
    """
    User <-> Recipe relationship for "favorite" or bookmarks.
    """
    user = models.ForeignKey('User', related_name='favorites', on_delete=models.CASCADE)
    recipe = models.ForeignKey('Recipe', related_name='favorited_by', on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'recipe')
        verbose_name = 'Favorite'
        verbose_name_plural = 'Favorites'

    def __str__(self):
        return f"{self.user.email} likes {self.recipe.title}"
