from rest_framework import serializers
from .models import ChatRoom, Message, Reaction
from users.serializers import UserSerializer

class ReactionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Reaction
        fields = ['id', 'user', 'emoji', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    reactions = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'room', 'content', 'timestamp', 'is_read', 'reactions']
        read_only_fields = ['timestamp']
    
    def get_reactions(self, obj):
        # Group reactions by emoji
        reactions_data = {}
        for reaction in obj.reactions.all():
            emoji = reaction.emoji
            if emoji not in reactions_data:
                reactions_data[emoji] = {
                    'emoji': emoji,
                    'count': 0,
                    'users': [],
                    'user_reacted': False
                }
            reactions_data[emoji]['count'] += 1
            reactions_data[emoji]['users'].append({
                'id': reaction.user.id,
                'username': reaction.user.username
            })
            # Check if current user reacted
            request = self.context.get('request')
            if request and request.user.id == reaction.user.id:
                reactions_data[emoji]['user_reacted'] = True
        
        return list(reactions_data.values())

class ChatRoomSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    members = UserSerializer(many=True, read_only=True)
    display_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'display_name', 'type', 'is_paid', 'price', 'members', 'last_message', 'created_at']
    
    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-timestamp').first()
        if last_msg:
            return MessageSerializer(last_msg, context=self.context).data
        return None
    
    def get_display_name(self, obj):
        # For direct chats, show the other user's name
        if obj.type == 'DIRECT':
            request = self.context.get('request')
            if request and request.user:
                other_user = obj.members.exclude(id=request.user.id).first()
                if other_user:
                    return other_user.username
        return obj.name
