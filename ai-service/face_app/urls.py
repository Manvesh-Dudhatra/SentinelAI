from django.urls import path
from .views import FaceCaptureAPIView

urlpatterns = [
    path("face-capture/", FaceCaptureAPIView.as_view(), name="face-capture"),
]