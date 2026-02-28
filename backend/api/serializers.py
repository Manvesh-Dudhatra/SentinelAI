import random
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Employee, FaceData, CustomUser
from .utils import generate_empcode
import numpy as np


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    face_embedding = serializers.ListField(
        child=serializers.FloatField(),
        write_only=True
    )

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def create(self, validated_data):
        face_embedding = validated_data.pop("face_embedding")
        user = CustomUser.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            is_active=False
        )

        employee = Employee.objects.create(
            user=user,
            emp_code=generate_empcode(),
            name = user.username
        )

        embedding_array = np.array(face_embedding)
        print(embedding_array)
        FaceData.objects.create(
            employee = employee,
            embedding = embedding_array.tobytes()
        )

        return user