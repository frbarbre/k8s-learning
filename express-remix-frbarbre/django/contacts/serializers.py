from rest_framework import serializers

class ContactSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    avatar = serializers.URLField()
    first = serializers.CharField(max_length=100)
    last = serializers.CharField(max_length=100)
    twitter = serializers.CharField(max_length=100)
    favorite = serializers.BooleanField(default=False)
    created_at = serializers.DateTimeField(read_only=True)

    def to_representation(self, instance):
        # Convert MongoDB _id to string
        instance['id'] = str(instance['_id'])
        del instance['_id']
        return super().to_representation(instance) 