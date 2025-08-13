from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from bson import ObjectId
from datetime import datetime
from .serializers import ContactSerializer
from .db import get_contacts_collection

class ContactViewSet(viewsets.ViewSet):
    def list(self, request):
        collection = get_contacts_collection()
        contacts = list(collection.find().sort([("created_at", -1), ("last", 1)]))
        serializer = ContactSerializer(contacts, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        collection = get_contacts_collection()
        try:
            contact = collection.find_one({"_id": ObjectId(pk)})
            if contact is None:
                return Response(status=status.HTTP_404_NOT_FOUND)
            serializer = ContactSerializer(contact)
            return Response(serializer.data)
        except:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def create(self, request):
        serializer = ContactSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            data['created_at'] = datetime.now()
            collection = get_contacts_collection()
            result = collection.insert_one(data)
            contact = collection.find_one({"_id": result.inserted_id})
            serializer = ContactSerializer(contact)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        collection = get_contacts_collection()
        serializer = ContactSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            result = collection.update_one(
                {"_id": ObjectId(pk)},
                {"$set": data}
            )
            if result.modified_count == 0:
                return Response(status=status.HTTP_404_NOT_FOUND)
            contact = collection.find_one({"_id": ObjectId(pk)})
            serializer = ContactSerializer(contact)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        collection = get_contacts_collection()
        result = collection.delete_one({"_id": ObjectId(pk)})
        if result.deleted_count == 0:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def search(self, request):
        q = request.query_params.get('q', '')
        collection = get_contacts_collection()
        contacts = list(collection.find({
            "$or": [
                {"first": {"$regex": q, "$options": "i"}},
                {"last": {"$regex": q, "$options": "i"}},
                {"twitter": {"$regex": q, "$options": "i"}}
            ]
        }))
        serializer = ContactSerializer(contacts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def favorite(self, request, pk=None):
        collection = get_contacts_collection()
        contact = collection.find_one({"_id": ObjectId(pk)})
        if contact is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        new_favorite_status = not contact.get('favorite', False)
        collection.update_one(
            {"_id": ObjectId(pk)},
            {"$set": {"favorite": new_favorite_status}}
        )
        contact['favorite'] = new_favorite_status
        serializer = ContactSerializer(contact)
        return Response(serializer.data)