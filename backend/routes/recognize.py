from fastapi import APIRouter, UploadFile, File, Form
import os
import uuid
from services.cache import sync_faces
from deepface import DeepFace
from database import supabase
from datetime import datetime

router = APIRouter(
    prefix="/recognize",
    tags=["Recognition"]
)

TEMP_FOLDER = "temp"

os.makedirs(TEMP_FOLDER, exist_ok=True)

@router.post("/")
async def recognize_face(
    image: UploadFile = File(...),
    camera_name: str = Form(...)
):

    extension = image.filename.split(".")[-1]

    filename = f"{uuid.uuid4()}.{extension}"

    temp_path = os.path.join(
        TEMP_FOLDER,
        filename
    )

    image_bytes = await image.read()

    with open(temp_path, "wb") as f:
        f.write(image_bytes)

    sync_faces()

    # def recognize_face(temp_path: str):
    #     results = DeepFace.find(
    #         img_path=temp_path,
    #         db_path="cache",
    #         enforce_detection=False
    #     )
    #     return results
    
    results = DeepFace.find(
        img_path=temp_path,
        db_path="cache",
        enforce_detection=False,
        detector_backend="retinaface"
    )

    if len(results) == 0 or results[0].empty:
        return {
            "matched": False
        }

    best_match = results[0].iloc[0]

    identity_path = best_match["identity"]

    person_id = os.path.basename(
        os.path.dirname(identity_path)
    )

    person = (
        supabase.table("persons")
        .select("*")
        .eq("id", person_id)
        .execute()
    )

    best_match = results[0].iloc[0]

    distance = float(best_match["distance"])

    if distance > 0.60:
        return {
            "matched": False,
            "distance": distance,
            "identity": None
        }
    
    supabase.table("detections").insert({
        "person_id": person_id,
        "camera_name": camera_name,
        "confidence": float(best_match["confidence"])
    }).execute()

    new_count = person.data[0]["appearance_count"] + 1

    supabase.table("persons").update({
        "appearance_count": new_count,
        "last_seen": datetime.now().isoformat()
    }).eq("id", person_id).execute()

    return {
        "identity": best_match["identity"],
        "distance": float(best_match["distance"]),
        "confidence": float(best_match["confidence"])
    }