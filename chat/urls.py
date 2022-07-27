from django.urls import path
from . import views


urlpatterns = [
    path('', views.messages_page, name="index"),
    path('login/', views.login, name="login"),
    path('register/', views.register, name="register"),
    path('logout', views.logout)
]
