from django.db import models
from django.db.models import Q

from myproject import settings
from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.models import User
from django.core.cache import cache
import datetime

# class User(AbstractBaseUser):
#     about = models.TextField()
#     def last_seen(self):
#         return cache.get('seen_%s' % self.user.username)

#     def online(self):
#         if self.last_seen():
#             now = datetime.datetime.now()
#             if now > self.last_seen() + datetime.timedelta(
#                     seconds=settings.USER_ONLINE_TIMEOUT):
#                 return False
#             else:
#                 return True
#         else:
#             return False


# Create your models here.
class UserAdd(models.Model):
    user = models.OneToOneField(User,related_name='useradd', on_delete=models.CASCADE)
    profile_name = models.CharField(max_length=255,null=True, blank=True)
    about = models.TextField(null=True, blank=True)
    user_image = models.ImageField(default='media/profile/default_profile.jpeg')


class ThreadManager(models.Manager):
    def by_user(self, **kwargs):
        user = kwargs.get('user')
        qs = self.get_queryset().filter(Q(first_person=user) | Q(second_person=user)).distinct()
        return qs


class Thread(models.Model):
    first_person = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True, blank=True, related_name='thread_first_person')
    second_person = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True, blank=True, related_name='thread_second_person')
    updated = models.DateTimeField(auto_now=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    objects = ThreadManager()

    class Meta:
        unique_together = ['first_person', 'second_person']


class ChatMessage(models.Model):
    thread = models.ForeignKey(Thread, null=True, blank=True,
                               on_delete=models.CASCADE, related_name='chatmessage')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    msg_image = models.ImageField(upload_to ='uploads/',null=True,blank=True)
    status = models.IntegerField()
    timestamp = models.DateTimeField()