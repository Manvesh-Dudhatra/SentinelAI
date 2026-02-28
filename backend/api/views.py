import random
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer

class RegisterAPIView(APIView):

    def post(self, request):
        serializer = RegisterSerializer(
            data=request.data,
        )

        if not serializer.is_valid():
            print(serializer.errors)
            return Response(serializer.errors, status=400)

        user = serializer.save()

       
        return Response(
            {"message": "Register successfully"},
            status=status.HTTP_200_OK
        )