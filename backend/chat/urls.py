from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatRoomViewSet, AdminChatRoomViewSet

router = DefaultRouter()
router.register(r'rooms', ChatRoomViewSet, basename='chatroom')
router.register(r'admin/rooms', AdminChatRoomViewSet, basename='admin-chatroom')

urlpatterns = [
    path('', include(router.urls)),
]
