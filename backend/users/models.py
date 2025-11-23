from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Roles(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        STAFF = 'STAFF', 'Staff'
        PAID = 'PAID', 'Paid User'
        FREE = 'FREE', 'Free User'

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        SUSPENDED = 'SUSPENDED', 'Suspended'
        REJECTED = 'REJECTED', 'Rejected'
        PENDING = 'PENDING', 'Pending Approval'

    role = models.CharField(
        max_length=10,
        choices=Roles.choices,
        default=Roles.FREE,
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )
    is_approved = models.BooleanField(default=False)  # Keep for backwards compatibility
    
    def save(self, *args, **kwargs):
        # Sync is_approved with status
        self.is_approved = (self.status == self.Status.ACTIVE)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.username} ({self.role})"
