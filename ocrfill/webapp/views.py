from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse

from .controller.imageocr import process_img

# Create your views here.
def index(request):
    return render(request, 'index.html')

def register(request):
    return render(request, 'register.html')

def read_image(request):
    img = request.FILES["img"]
    result = process_img(img)
    return JsonResponse(result)
