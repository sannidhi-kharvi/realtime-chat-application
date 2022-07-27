from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

from .models import Thread, ChatMessage, UserAdd


class UserAddInline(admin.StackedInline):
    model = UserAdd
    can_delete = False
    verbose_name_plural = 'useradd'

# Define a new User admin

class UserAdmin(BaseUserAdmin):
    inlines = (UserAddInline,)


# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

admin.site.register(ChatMessage)

admin.site.register(Thread)
