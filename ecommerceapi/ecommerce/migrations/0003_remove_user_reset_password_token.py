# Generated by Django 5.0.4 on 2024-05-13 12:42

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('ecommerce', '0002_tag_remove_order_user_remove_product_sold_inventory_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='reset_password_token',
        ),
    ]
