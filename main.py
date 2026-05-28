import cv2
from ultralytics import YOLO
import csv
import os
from datetime import datetime
from deepface import DeepFace

#CSV file start
logged_ids = set()
csv_file = "person_log.csv"

#if not os.path.exists(csv_file):                    #for rewriting old file
with open(csv_file, mode='w', newline='') as file:      #overwrite old file
    writer = csv.writer(file)
    writer.writerow([
        "Person_ID",
        "Timestamp"
    ])

# Load YOLO model
model = YOLO("yolov8n-face.pt")

#if have NVIDIA GPU
#model = YOLO("yolov8n.pt").to('cuda')
#if you have Apple Silicon
#model = YOLO("yolov8n.pt").to('mps')

# Start webcam
cap = cv2.VideoCapture(0)

cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

#detection loop
while True:

    ret, frame = cap.read()
    if not ret:
        print("Couldn't Connect to Camera")
        break
    frame = cv2.flip(frame, 1)
    
    # Run YOLO detection
    small = cv2.resize(frame, (320, 240))
    results = model.track(small, conf=0.5, persist=True, verbose=False)   #stores all objects found in frame

    for result in results:

        boxes = result.boxes      #the co-ords and class id of objects from results 

        for box in boxes:

                x1, y1, x2, y2 = map(int, box.xyxy[0])    #co-ords of person
                x1, y1, x2, y2 = x1*2, y1*2, x2*2, y2*2
                face_img = frame[y1:y2, x1:x2]

                try:
                    result = DeepFace.find(
                        img_path=face_img,
                        db_path="known_faces",
                        enforce_detection=False,
                        silent=True
                    )

                    # If face matched
                    if len(result) > 0 and not result[0].empty:

                        person_path = result[0].iloc[0]['identity']

                        # Extract name from file path
                        name = person_path.split("\\")[-1].split(".")[0]

                        cv2.putText(
                            frame,
                            f"{name}",
                            (50, 50),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            1,
                            (0, 255, 0),
                            2
                        )
                except Exception as e:
                    print (e)

                confidence = float(box.conf[0])    #model's surety of person
                track_id = None

                if box.id is not None:
                    track_id = int(box.id[0])

                # Draw box if sure of person
                if confidence>=0.8:
                    # Log only once per tracked person
                    if track_id is not None and track_id not in logged_ids:    #logged_ids is a set() that stores all IDs already recorded.
                        logged_ids.add(track_id)
                        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                        with open(csv_file, mode='a', newline='') as file:
                            writer = csv.writer(file)
                            writer.writerow([
                                track_id,
                                timestamp
                            ])
                        print(f"Logged Person {track_id} at {timestamp}")
                    cv2.rectangle(
                        frame,
                        (x1, y1),
                        (x2, y2),
                        (0, 255, 0),
                        2
                    )

                    cv2.putText(
                        frame,
                        f"ID {track_id} {confidence:.2f}",
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