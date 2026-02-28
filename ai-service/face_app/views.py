import base64
import torch
from io import BytesIO
from PIL import Image
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from facenet_pytorch import MTCNN, InceptionResnetV1

# Initialize models once
mtcnn = MTCNN(keep_all=True)
resnet = InceptionResnetV1(pretrained='vggface2').eval()


class FaceCaptureAPIView(APIView):

    def post(self, request):

        image_data = request.data.get("image")

        if not image_data:
            return Response(
                {"error": "No image provided"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Decode base64 image
            if "base64," not in image_data:
                return Response(
                    {"error": "Invalid image format"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            header, imgstr = image_data.split(";base64,")
            img_bytes = base64.b64decode(imgstr)
            image = Image.open(BytesIO(img_bytes)).convert("RGB")

        except Exception as e:
            print("Decode Error:", e)
            return Response(
                {"error": "Invalid image format"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Detect faces
        boxes, _ = mtcnn.detect(image)

        if boxes is None:
            return Response(
                {"error": "No face detected"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(boxes) > 1:
            return Response(
                {"error": "Multiple faces detected"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Extract aligned face
        face = mtcnn(image)

        if face is None:
            return Response(
                {"error": "Face alignment failed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate embedding
        with torch.no_grad():
            embedding = resnet(face)

        embedding_np = embedding.numpy().tolist()

        # Store in session
        request.session["face_embedding"] = embedding_np
        request.session.save()

        return Response(
            {"message": "Face captured successfully",
            'embedding': embedding.tolist()},
            status=status.HTTP_200_OK
        )