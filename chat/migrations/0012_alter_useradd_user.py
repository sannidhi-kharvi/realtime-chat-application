# Generated by Django 3.2.9 on 2021-12-14 16:56

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('chat', '0011_alter_useradd_user_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='useradd',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='useradd', to=settings.AUTH_USER_MODEL),
        ),
    ]