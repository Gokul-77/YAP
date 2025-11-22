from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Roles(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        STAFF = 'STAFF', 'Staff'
        PAID = 'PAID', 'Paid User'
        FREE = 'FREE', 'Free User'

    role = models.CharField(
        max_length=10,
        choices=Roles.choices,
        default=Roles.FREE,
    )
    is_approved = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.username} ({self.role})"
