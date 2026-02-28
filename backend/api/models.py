from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid


class CustomUser(AbstractUser):
    id = models.UUIDField(primary_key=True, editable=False, default = uuid.uuid4())
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.username

class Employee(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default = uuid.uuid4())
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    emp_code = models.CharField(max_length=6)
    name = models.CharField(max_length= 30, null=True)
    mobile = models.CharField(max_length=10, null=True)
    dob = models.DateField(null=True)
    designation = models.CharField(max_length= 20, null=True)
    department = models.CharField(max_length= 10, null=True)
    date_joined = models.DateField(null=True)
    is_active = models.BooleanField(default=False, null=True)
    created_at = models.DateField(auto_now_add=True, null=True)
    update_at = models.DateField(auto_now=True, null=True)

class Attendence(models.Model):
    STATUS = (
        ("ACTIVE", "Active"),
        ("PAUSED", "Paused"),
        ("ENDED", "Ended"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4(), editable=False)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="sessions")
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    total_work_time = models.DurationField(null=True, blank=True)
    total_idle_time = models.DurationField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS, default="ACTIVE")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.status

class FaceData(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4(), editable=False)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="faces")
    embedding = models.BinaryField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)


