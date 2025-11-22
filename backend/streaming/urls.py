from django.urls import path
from .views import StreamListView, StreamDetailView

urlpatterns = [
    path('', StreamListView.as_view(), name='stream-list'),
    path('<int:pk>/', StreamDetailView.as_view(), name='stream-detail'),
]
