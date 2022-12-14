# Generated by Django 3.2.9 on 2021-12-13 18:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0009_useradd'),
    ]

    operations = [
        migrations.AlterField(
            model_name='useradd',
            name='about',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='useradd',
            name='user_image',
            field=models.ImageField(blank=True, null=True, upload_to='uploads/'),
        ),
    ]
