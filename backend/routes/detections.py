from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from database import supabase

router = APIRouter(
	prefix="/detections",
	tags=["Detections"]
)


class DetectionCreate(BaseModel):
	person_id: str | None = None
	name: str | None = None
	camera_name: str | None = None
	confidence: float = Field(ge=0, le=1)
	detected_at: str | None = None


def resolve_person_id(person_id: str | None, name: str | None) -> str | None:
	if person_id:
		return person_id

	if not name or name == "Unknown":
		return None

	response = (
		supabase.table("persons")
		.select("id")
		.eq("name", name)
		.limit(1)
		.execute()
	)

	if response.data:
		return response.data[0]["id"]

	return None


@router.post("/")
def create_detection(payload: DetectionCreate):
	try:
		resolved_person_id = resolve_person_id(payload.person_id, payload.name)
		camera_name = payload.camera_name or "cam_1"
		insert_payload = {
			"person_id": resolved_person_id,
			"camera_name": camera_name,
			"confidence": payload.confidence,
		}

		if payload.detected_at:
			insert_payload["detected_at"] = payload.detected_at

		response = (
			supabase.table("detections")
			.insert(insert_payload)
			.execute()
		)

		detection = response.data[0]
		person_name = None

		if detection.get("person_id"):
			person_response = (
				supabase.table("persons")
				.select("name")
				.eq("id", detection["person_id"])
				.limit(1)
				.execute()
			)

			if person_response.data:
				person_name = person_response.data[0]["name"]

		return {
			"message": "Detection saved successfully",
			"detection": {
				"id": detection.get("id"),
				"person_id": detection.get("person_id"),
				"person_name": person_name,
				"camera_name": detection.get("camera_name", camera_name),
				"confidence": detection.get("confidence", payload.confidence),
				"detected_at": detection.get("detected_at")
			}
		}
	except Exception as e:
		raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
def list_detections():
	try:
		response = (
			supabase.table("detections")
			.select("id, person_id, camera_name, confidence, detected_at, persons(name)")
			.order("detected_at", desc=True)
			.limit(100)
			.execute()
		)

		result = []

		for row in response.data:
			person_relation = row.get("persons")
			person_name = None

			if isinstance(person_relation, list) and person_relation:
				person_name = person_relation[0].get("name")
			elif isinstance(person_relation, dict):
				person_name = person_relation.get("name")

			result.append({
				"id": row.get("id"),
				"person_id": row.get("person_id"),
				"person_name": person_name or "Unknown",
				"camera_name": row.get("camera_name"),
				"confidence": row.get("confidence", 0),
				"detected_at": row.get("detected_at"),
			})

		return result
	except Exception as e:
		raise HTTPException(status_code=500, detail=str(e))
