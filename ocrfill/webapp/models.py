from django.db import models

# Create your models here.
class Pan(models.Model):
    pan = models.CharField(max_length=12)
    name = models.CharField(max_length=100)
    father_name = models.CharField(max_length=100)
    dob = models.DateTimeField('date of birth')
