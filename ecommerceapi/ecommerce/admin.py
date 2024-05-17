from django.contrib import admin
from ecommerce.models import User, Product, Category, Order, OrderDetail, Store, Tag, ProductComment, ProductRating, StoreComment, StoreRating
from django import forms
from ckeditor_uploader.widgets import CKEditorUploadingWidget

class CommerceAdminSite(admin.AdminSite):
    site_header = 'ECommerce Admin Site'

class DetailInline(admin.TabularInline):
    model = OrderDetail
    extra = 1

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

class MyStoreAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'email', 'phone_number', 'created_date', 'updated_date', 'active']
    search_fields = ['name', 'description']
    list_filter = ['id', 'created_date', 'name']

class MyOrderAdmin(admin.ModelAdmin):
    inlines = [DetailInline]


admin_site = CommerceAdminSite(name='ecommerce')
# Register your models here.
admin_site.register(User)
admin_site.register(Category)
admin_site.register(Tag)
admin_site.register(Store, MyStoreAdmin)
admin_site.register(StoreComment)
admin_site.register(StoreRating)
admin_site.register(Product, MyProductAdmin)
admin_site.register(ProductComment)
admin_site.register(ProductRating)
admin_site.register(Order, MyOrderAdmin)
admin_site.register(OrderDetail)
