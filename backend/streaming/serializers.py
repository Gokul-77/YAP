from rest_framework import serializers
from .models import StreamEvent

class StreamEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = StreamEvent
        fields = '__all__'
        read_only_fields = ('created_by',)
