# Generated by Django 3.2.9 on 2021-12-13 16:17

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0002_chatmessage_msg_image'),
    ]

    operations = [
        migrations.DeleteModel(
            name='User',
        ),
    ]