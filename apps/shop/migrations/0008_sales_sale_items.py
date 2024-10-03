# Generated by Django 5.0.7 on 2024-08-29 11:35

import apps.shop.models
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shop', '0007_alter_product_qty'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Sales',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('saledate', models.DateTimeField(default=apps.shop.models.dtime)),
                ('amount', models.FloatField()),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='sales_user', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Sale_items',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('price', models.FloatField()),
                ('qty', models.FloatField()),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='sale_product', to='shop.product')),
                ('sale', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='sales', to='shop.sales')),
            ],
        ),
    ]
