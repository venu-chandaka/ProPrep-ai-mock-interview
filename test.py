import cv2
import mediapipe as mp
import time
import json

# ===== MEDIAPIPE =====
mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Eye landmarks
LEFT_EYE = [33, 133]
RIGHT_EYE = [362, 263]

# ===== VIDEO =====
cap = cv2.VideoCapture(0)

start_time = time.time()
eye_contact_frames = 0
total_frames = 0

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    h, w, _ = frame.shape
    total_frames += 1

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = face_mesh.process(rgb)

    eye_contact = False

    if result.multi_face_landmarks:
        face = result.multi_face_landmarks[0]

        # Draw face mesh (body behavior visual)
        mp_drawing.draw_landmarks(
            frame,
            face,
            mp_face_mesh.FACEMESH_TESSELATION,
            mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=1, circle_radius=1),
            mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=1)
        )

        lx = int((face.landmark[LEFT_EYE[0]].x +
                  face.landmark[LEFT_EYE[1]].x) * w / 2)
        rx = int((face.landmark[RIGHT_EYE[0]].x +
                  face.landmark[RIGHT_EYE[1]].x) * w / 2)

        ly = int(face.landmark[LEFT_EYE[0]].y * h)
        ry = int(face.landmark[RIGHT_EYE[0]].y * h)

        eye_center_x = (lx + rx) // 2

        # Draw eye points
        cv2.circle(frame, (lx, ly), 5, (255, 0, 0), -1)
        cv2.circle(frame, (rx, ry), 5, (255, 0, 0), -1)

        if w * 0.4 < eye_center_x < w * 0.6:
            eye_contact = True
            eye_contact_frames += 1

    # ===== METRICS =====
    eye_percentage = (eye_contact_frames / total_frames) * 100
    confidence_score = min(100, int(eye_percentage))

    # ===== COLOR LOGIC =====
    if eye_percentage > 70:
        color = (0, 255, 0)
        label = "Good Eye Contact"
    elif eye_percentage > 40:
        color = (0, 255, 255)
        label = "Average Eye Contact"
    else:
        color = (0, 0, 255)
        label = "Poor Eye Contact"

    # ===== REAL-TIME OVERLAY =====
    cv2.putText(frame, f"Eye Contact: {eye_percentage:.2f}%",
                (30, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

    cv2.putText(frame, f"Confidence Score: {confidence_score}",
                (30, 75), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

    cv2.putText(frame, label,
                (30, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

    # Visual indicator on face
    if eye_contact:
        cv2.putText(frame, "✔",
                    (w // 2 - 10, h // 2),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3)

    cv2.imshow("AI Interview Body Behavior Analyzer", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

# ===== FINAL JSON FOR AI AGENTS =====
output = {
    "eye_contact_percentage": round(eye_percentage, 2),
    "confidence_score": confidence_score,
    "total_time_seconds": round(time.time() - start_time, 2),
    "total_frames": total_frames,
    "eye_contact_frames": eye_contact_frames,
}

with open("body_behavior.json", "w") as f:
    json.dump(output, f, indent=4)

print("\n=== FINAL INTERVIEW ANALYSIS ===")
print(json.dumps(output, indent=4))
