from datetime import datetime
from pathlib import Path
import tempfile

import cv2
import requests
from deepface import DeepFace
from ultralytics import YOLO

recognized_people = {}
logged_ids = set()

API_BASE_URL = "http://127.0.0.1:8000"
PERSONS_URL = f"{API_BASE_URL}/persons/"
DETECTIONS_URL = f"{API_BASE_URL}/detections/"
CACHE_DIR = Path("backend/cache")


def resolve_person_name(person_id: str) -> str:
    try:
        response = requests.get(f"{PERSONS_URL}{person_id}", timeout=5)
        response.raise_for_status()
        return response.json()["person"]["name"]
    except Exception:
        return person_id


def recognize_face(face_img) -> str:
    if face_img.size == 0:
        return "Unknown"

    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as temp_file:
            temp_path = temp_file.name

        if not cv2.imwrite(temp_path, face_img):
            return "Unknown"

        results = DeepFace.find(
            img_path=temp_path,
            db_path=str(CACHE_DIR),
            enforce_detection=False,
            detector_backend="retinaface"
        )

        if not results or results[0].empty:
            return "Unknown"

        best_match = results[0].iloc[0]

        if float(best_match["distance"]) > 0.60:
            return "Unknown"

        person_id = Path(str(best_match["identity"])).parent.name
        return resolve_person_name(person_id)
    except Exception:
        return "Unknown"
    finally:
        if temp_path:
            Path(temp_path).unlink(missing_ok=True)


model = YOLO("yolov8n-face.pt")

cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

while True:
    ret, frame = cap.read()
    if not ret:
        print("Couldn't Connect to Camera")
        break

    frame = cv2.flip(frame, 1)
    small = cv2.resize(frame, (320, 240))
    results = model.track(small, conf=0.5, persist=True, verbose=False)

    for result in results:
        boxes = result.boxes

        for box in boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            x1, y1, x2, y2 = x1 * 2, y1 * 2, x2 * 2, y2 * 2
            face_img = frame[y1:y2, x1:x2]
            confidence = float(box.conf[0])
            track_id = int(box.id[0]) if box.id is not None else None

            if track_id is not None and track_id not in recognized_people:
                recognized_people[track_id] = recognize_face(face_img)

            name = recognized_people.get(track_id, "Unknown")

            if confidence >= 0.8:
                if track_id is not None and track_id not in logged_ids:
                    logged_ids.add(track_id)
                    timestamp = datetime.now().isoformat()

                    try:
                        requests.post(
                            DETECTIONS_URL,
                            json={
                                "name": name,
                                "timestamp": timestamp,
                                "confidence": confidence
                            },
                            timeout=5
                        )
                    except Exception as e:
                        print(e)

                    print(f"Logged Person {name} at {timestamp}")

                cv2.rectangle(
                    frame,
                    (x1, y1),
                    (x2, y2),
                    (0, 255, 0),
                    2
                )

                cv2.putText(
                    frame,
                    f"ID {name} {confidence:.2f}",
                    (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 255, 0),
                    2
                )

    cv2.imshow("Face Detection", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()