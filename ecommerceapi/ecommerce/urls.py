from django.urls import path, include
from rest_framework import routers
from ecommerce import views

r = routers.DefaultRouter()
r.register('categories', views.CategoryViewSet, basename='categories')
r.register('products', views.ProductViewSet, basename='products')
r.register('stores', views.StoreViewSet, basename='stores')
r.register('users', views.UserViewSet, basename='users')
r.register('store_comments', views.StoreCommentViewSet, basename='store_comments')
r.register('store_ratings', views.StoreRatingViewSet, basename='store_ratings')
r.register('product_comments', views.ProductCommentViewSet, basename='product_comments')
r.register('product_ratings', views.ProductRatingViewSet, basename='product_ratings')
# r.register('orders', views.OrderViewSet, basename='orders')


urlpatterns = [
    path('', include(r.urls))
]