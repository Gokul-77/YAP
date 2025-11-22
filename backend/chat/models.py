from django.db import models
from django.conf import settings

class ChatRoom(models.Model):
    ROOM_TYPES = (
        ('DIRECT', 'Direct'),
        ('GROUP', 'Group'),
    )
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=10, choices=ROOM_TYPES)
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='chat_rooms')
    is_paid = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f'{self.sender.username}: {self.content[:50]}'

class Reaction(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    emoji = models.CharField(max_length=10)  # Stores emoji like "👍", "❤️", etc.
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('message', 'user', 'emoji')  # One emoji per user per message
    
    def __str__(self):
        return f'{self.user.username} {self.emoji} on {self.message.id}'
