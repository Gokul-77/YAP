from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import UserSerializer, RegisterSerializer
from .auth_serializers import CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserListView(generics.ListAPIView):
    """List all users (for starting new chats)"""
    queryset = User.objects.filter(is_approved=True)
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Exclude the current user from the list
        return User.objects.filter(is_approved=True).exclude(id=self.request.user.id)

from rest_framework import viewsets
from rest_framework.decorators import action
from .serializers import AdminUserSerializer
from .permissions import IsAdmin

class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        """Suspend a user"""
        user = self.get_object()
        user.status = User.Status.SUSPENDED
        user.save()
        return Response({'status': 'user suspended'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a user"""
        user = self.get_object()
        user.status = User.Status.REJECTED
        user.save()
        return Response({'status': 'user rejected'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a user"""
        user = self.get_object()
        user.status = User.Status.ACTIVE
        user.save()
        return Response({'status': 'user activated'}, status=status.HTTP_200_OK)

from django.utils import timezone
from django.db.models import Q
from chat.models import Message
from streaming.models import StreamEvent

class DashboardStatsView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        today = timezone.now().date()
        
        # Online Users (Using total approved users for now as proxy)
        online_users = User.objects.filter(is_approved=True).count()

        # Messages Today
        messages_today = Message.objects.filter(timestamp__date=today).count()

        # Active Streams
        now = timezone.now()
        active_streams = StreamEvent.objects.filter(
            start_time__lte=now
        ).filter(
            Q(end_time__isnull=True) | Q(end_time__gte=now)
        ).count()

        return Response({
            'online_users': online_users,
            'messages_today': messages_today,
            'active_streams': active_streams,
            'system_health': 'Operational'
        })
