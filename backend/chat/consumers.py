import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatRoom, Message
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type', 'chat_message')
        
        if message_type == 'reaction_update':
            # Broadcast reaction update to all users in the room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'reaction_update',
                    'message_id': text_data_json.get('message_id'),
                    'emoji': text_data_json.get('emoji'),
                    'user_id': text_data_json.get('user_id'),
                    'action': text_data_json.get('action')
                }
            )
        else:
            # Handle chat message
            message = text_data_json['message']
            user_id = text_data_json.get('user_id')

            # Save message to database
            await self.save_message(user_id, message)

            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'user_id': user_id
                }
            )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        user_id = event['user_id']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'user_id': user_id
        }))
    
    # Handle reaction updates
    async def reaction_update(self, event):
        # Send reaction update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'reaction_update',
            'message_id': event['message_id'],
            'emoji': event.get('emoji'),
            'user_id': event.get('user_id'),
            'action': event.get('action')
        }))

    @database_sync_to_async
    def save_message(self, user_id, content):
        user = User.objects.get(id=user_id)
        room = ChatRoom.objects.get(id=self.room_id)
        Message.objects.create(sender=user, room=room, content=content)
