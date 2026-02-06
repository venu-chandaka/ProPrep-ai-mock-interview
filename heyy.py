import cv2
import mediapipe as mp
import time
import json

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

LEFT_EYE = [33, 133]
RIGHT_EYE = [362, 263]

cap = cv2.VideoCapture(0)

start_time = time.time()
eye_contact_frames = 0
total_frames = 0

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    total_frames += 1
    h, w, _ = frame.shape

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = face_mesh.process(rgb)

    if result.multi_face_landmarks:
        face = result.multi_face_landmarks[0]

        lx = int((face.landmark[LEFT_EYE[0]].x +
                  face.landmark[LEFT_EYE[1]].x) * w / 2)
        rx = int((face.landmark[RIGHT_EYE[0]].x +
                  face.landmark[RIGHT_EYE[1]].x) * w / 2)

        eye_center_x = (lx + rx) // 2

        if w * 0.4 < eye_center_x < w * 0.6:
            eye_contact_frames += 1

    cv2.imshow("Interview Analyzer", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()

# ===== FINAL METRICS =====
total_time = round(time.time() - start_time, 2)
eye_contact_percentage = round((eye_contact_frames / total_frames) * 100, 2)
confidence_score = min(100, int(eye_contact_percentage))

if eye_contact_percentage > 70:
    consistency = "Good"
elif eye_contact_percentage > 40:
    consistency = "Average"
else:
    consistency = "Poor"

output = {
    "eye_contact_percentage": eye_contact_percentage,
    "confidence_score": confidence_score,
    "total_time_seconds": total_time,
    "eye_contact_frames": eye_contact_frames,
    "total_frames": total_frames,
    "eye_contact_consistency": consistency
}

# Save for AI agents
with open("body_behavior.json", "w") as f:
    json.dump(output, f, indent=4)

print("\n=== INTERVIEW BODY BEHAVIOR DATA ===")
print(json.dumps(output, indent=4))
