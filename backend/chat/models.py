from django.db import models
from django.conf import settings

class ChatRoom(models.Model):
    class RoomType(models.TextChoices):
        DIRECT = 'DIRECT', 'Direct Message'
        GROUP = 'GROUP', 'Group Chat'

    name = models.CharField(max_length=255, blank=True, null=True)
    type = models.CharField(max_length=10, choices=RoomType.choices, default=RoomType.DIRECT)
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='chat_rooms')
    is_paid = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name or f"Chat {self.id}"

class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.sender} in {self.room}: {self.content[:20]}"
