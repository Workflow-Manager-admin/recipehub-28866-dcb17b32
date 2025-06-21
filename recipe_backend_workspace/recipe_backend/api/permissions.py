from rest_framework.permissions import BasePermission, SAFE_METHODS


# PUBLIC_INTERFACE
class IsOwnerOrReadOnly(BasePermission):
    """
    Object-level permission to only allow authors of an object to edit or delete it.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.author == request.user


# PUBLIC_INTERFACE
class IsSelfOrReadOnly(BasePermission):
    """
    Permission for user detail: Only the user can update/delete themselves.
    """

    def has_object_permission(self, request, view, obj):
        return obj == request.user
