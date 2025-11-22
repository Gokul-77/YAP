from django.contrib import admin
from .models import StreamEvent

@admin.register(StreamEvent)
class StreamEventAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'is_paid', 'price', 'start_time', 'end_time', 'created_by')
    list_filter = ('is_paid', 'start_time')
    search_fields = ('title', 'description')
