from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer
from users.permissions import IsAdmin

class ChatRoomViewSet(viewsets.ModelViewSet):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see rooms they're members of
        return ChatRoom.objects.filter(members=self.request.user)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        room = self.get_object()
        messages = room.messages.all()
        serializer = MessageSerializer(messages, many=True)
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
        """Create a group chat (Admin only)"""
        name = request.data.get('name')
        is_paid = request.data.get('is_paid', False)
        price = request.data.get('price', 0)
        
        room = ChatRoom.objects.create(
            type='GROUP',
            name=name,
            is_paid=is_paid,
            price=price
        )
        room.members.add(request.user)
        serializer = self.get_serializer(room)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
