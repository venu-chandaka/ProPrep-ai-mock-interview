from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2
import mediapipe as mp
import numpy as np
import base64

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

mp_face = mp.solutions.face_mesh
face_mesh = mp_face.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True
)

class ImagePayload(BaseModel):
    image: str

@app.post("/analyze")
def analyze(payload: ImagePayload):
    img_bytes = base64.b64decode(payload.image.split(",")[1])
    np_img = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb)

    eye_contact = False
    if results.multi_face_landmarks:
        face = results.multi_face_landmarks[0]
        left_eye = face.landmark[33]
        right_eye = face.landmark[263]
        eye_center = int(((left_eye.x + right_eye.x) / 2) * w)

        if w * 0.38 < eye_center < w * 0.62:
            eye_contact = True

    return {"eye_contact": eye_contact}