from rest_framework import generics, permissions
from .models import StreamEvent
from .serializers import StreamEventSerializer
from users.permissions import IsPaidUser, IsAdmin

class StreamListView(generics.ListCreateAPIView):
    queryset = StreamEvent.objects.all()
    serializer_class = StreamEventSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class StreamDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StreamEvent.objects.all()
    serializer_class = StreamEventSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdmin()]
        # For GET, check if paid
        return [permissions.IsAuthenticated()] 
        # Note: Fine-grained permission (IsPaidUser) logic should be added here or in get_object
