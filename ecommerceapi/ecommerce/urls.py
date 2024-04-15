from django.urls import path, include
from rest_framework import routers
from ecommerce import views

r = routers.DefaultRouter()
r.register('categories', views.CategoryViewSet, basename='catogories')
r.register('products', views.ProductViewSet, basename='products')
urlpatterns = [
    path('', include(r.urls))
]