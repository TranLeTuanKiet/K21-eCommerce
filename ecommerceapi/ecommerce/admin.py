from django.contrib import admin
from ecommerce.models import (User, Product, Category, Order, OrderDetail, Store)
from django import forms
from ckeditor_uploader.widgets import CKEditorUploadingWidget
class ProductForm(forms.ModelForm):
    description = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        model = Product
        fields = '__all__'

class MyProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'inventory_quantity', 'price', 'created_date', 'updated_date', 'active']
    search_fields = ['name', 'description']
    list_filter = ['id', 'created_date', 'name']
    form = ProductForm

class StoreForm(forms.ModelForm):
    description = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        model = Store
        fields = '__all__'

class MyStoreAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'email', 'phone_number', 'created_date', 'updated_date', 'active']
    search_fields = ['name', 'description']
    list_filter = ['id', 'created_date', 'name']
    form = StoreForm

# Register your models here.
admin.site.register(Category)
admin.site.register(Product, MyProductAdmin)
admin.site.register(Store, MyStoreAdmin)
admin.site.register(Order)
admin.site.register(User)