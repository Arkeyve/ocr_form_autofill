from django.urls import path
from . import views

urlpatterns = [
        path('', views.index, name="index"),
        path('register', views.register, name="register"),
        path('read_image', views.read_image, name="read_image")
    ]
