from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ChatRoom, Message, Reaction
from .serializers import ChatRoomSerializer, MessageSerializer
from users.permissions import IsAdmin

class ChatRoomViewSet(viewsets.ModelViewSet):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see rooms they're members of
        return ChatRoom.objects.filter(members=self.request.user)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        room = self.get_object()
        
        # Mark unread messages from other users as read
        unread_messages = room.messages.filter(is_read=False).exclude(sender=request.user)
        if unread_messages.exists():
            unread_messages.update(is_read=True)
            
            # Notify group about read receipt
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'chat_{room.id}',
                {
                    'type': 'messages_read',
                    'user_id': request.user.id,
                    'username': request.user.username
                }
            )

        messages = room.messages.all().order_by('timestamp')
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='messages/(?P<message_id>[^/.]+)/react')
    def add_reaction(self, request, pk=None, message_id=None):
        """Add emoji reaction to a message"""
        room = self.get_object()
        emoji = request.data.get('emoji')
        
        if not emoji:
            return Response({'error': 'emoji required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            message = Message.objects.get(id=message_id, room=room)
        except Message.DoesNotExist:
            return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # ONE REACTION PER USER RULE: Remove any existing reaction from this user
        Reaction.objects.filter(message=message, user=request.user).delete()
        
        # Add new reaction
        Reaction.objects.create(
            message=message,
            user=request.user,
            emoji=emoji
        )
        
        # Return updated message
        serializer = MessageSerializer(message, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['delete'], url_path='messages/(?P<message_id>[^/.]+)/react')
    def remove_reaction(self, request, pk=None, message_id=None):
        """Remove emoji reaction from a message"""
        room = self.get_object()
        emoji = request.data.get('emoji')
        
        if not emoji:
            return Response({'error': 'emoji required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            message = Message.objects.get(id=message_id, room=room)
            reaction = Reaction.objects.get(message=message, user=request.user, emoji=emoji)
            reaction.delete()
        except (Message.DoesNotExist, Reaction.DoesNotExist):
            pass
        
        # Return updated message
        message = Message.objects.get(id=message_id)
        serializer = MessageSerializer(message, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def create_direct(self, request):
        """Create a 1-on-1 chat room"""
        other_user_id = request.data.get('user_id')
        if not other_user_id:
            return Response({'error': 'user_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if room already exists
        existing_room = ChatRoom.objects.filter(
            type='DIRECT',
            members=request.user
        ).filter(members__id=other_user_id).first()
        
        if existing_room:
            serializer = self.get_serializer(existing_room)
            return Response(serializer.data)
        
        # Create new room
        room = ChatRoom.objects.create(type='DIRECT', name=f'Chat')
        room.members.add(request.user, other_user_id)
        serializer = self.get_serializer(room)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], permission_classes=[IsAdmin])
    def create_group(self, request):
        """Create a group chat room (Admin only)"""
        name = request.data.get('name')
        is_paid = request.data.get('is_paid', False)
        price = request.data.get('price', 0)
        member_ids = request.data.get('member_ids', [])
        
        room = ChatRoom.objects.create(
            name=name,
            type='GROUP',
            is_paid=is_paid,
            price=price
        )
        # Add creator
        room.members.add(request.user)
        
        # Add selected members
        if member_ids:
            from users.models import User
            members = User.objects.filter(id__in=member_ids)
            room.members.add(*members)
        
        serializer = self.get_serializer(room)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
