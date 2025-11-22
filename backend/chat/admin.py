from django.contrib import admin
from .models import ChatRoom, Message, Reaction

@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'is_paid', 'price', 'created_at']
    list_filter = ['type', 'is_paid']
    search_fields = ['name']

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'room', 'content', 'timestamp', 'is_read']
    list_filter = ['room', 'is_read']
    search_fields = ['content']

@admin.register(Reaction)
class ReactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'message', 'emoji', 'created_at']
    list_filter = ['emoji']
