from rest_framework import permissions

class CommentOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, comment):
        return super().has_permission(request, view) and request.user == comment.buyer

class RatingOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, rating):
        return super().has_permission(request, view) and request.user == rating.buyer