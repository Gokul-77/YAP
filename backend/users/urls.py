from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, UserProfileView, CustomTokenObtainPairView, UserListView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('', UserListView.as_view(), name='user-list'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

from rest_framework.routers import DefaultRouter
from .views import AdminUserViewSet

router = DefaultRouter()
router.register('admin', AdminUserViewSet, basename='admin-users')

urlpatterns += router.urls
