from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from database import supabase
from models.person import PersonCreate
import uuid

router = APIRouter(
    prefix="/persons",
    tags=["Persons"]
)


@router.post("/")
async def create_person(

    name: str = Form(...),
    image: UploadFile = File(...)
):

   from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from database import supabase

router = APIRouter(
    prefix="/persons",
    tags=["Persons"]
)


@router.post("/")
async def create_person(
    name: str = Form(...),
    image: UploadFile = File(...)
):
    try:
        # STEP 1: Create the person first
        person_response = (
            supabase.table("persons")
            .insert({"name": name})
            .execute()
        )

        person = person_response.data[0]
        person_id = person["id"]

        # STEP 2: Create file path
        extension = image.filename.split(".")[-1]
        file_path = f"{person_id}/face_1.{extension}"

        # STEP 3: Read image bytes
        image_bytes = await image.read()

        # STEP 4: Upload to Supabase Storage
        supabase.storage.from_("known_faces").upload(
            path=file_path,
            file=image_bytes,
            file_options={
                "content-type": image.content_type
            }
        )

        # STEP 5: Save image information
        supabase.table("person_images").insert({
            "person_id": person_id,
            "image_path": file_path,
            "image_number": 1
        }).execute()

        return {
            "message": "Person created successfully",
            "person": person
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
@router.post("/{person_id}/images")
async def upload_person_image(
    person_id: str,
    image: UploadFile = File(...)
):
    person = (
    supabase.table("persons")
    .select("*")
    .eq("id", person_id)
    .execute()
    )

    if len(person.data) == 0:
        raise HTTPException(
        status_code=404,
        detail="Person not found"
        )
    images = (
        supabase.table("person_images")
        .select("*")
        .eq("person_id", person_id)
        .execute()
    )

    image_number = len(images.data) + 1
    extension = image.filename.split(".")[-1]
    file_path = f"{person_id}/face_{image_number}.{extension}"

    image_bytes = await image.read()

        # STEP 4: Upload to Supabase Storage
    supabase.storage.from_("known_faces").upload(
        path=file_path,
        file=image_bytes,
        file_options={
            "content-type": image.content_type
        }
    )

    # STEP 5: Save image information
    supabase.table("person_images").insert({
        "person_id": person_id,
        "image_path": file_path,
        "image_number": image_number
    }).execute()

    return {
        "message": "Image uploaded successfully",
        "person_id": person_id,
        "image_number": image_number
    }

@router.get("/")
def get_all_persons():

    persons = (
        supabase.table("persons")
        .select("*")
        .execute()
    )

    result = []

    for person in persons.data:

        images = (
            supabase.table("person_images")
            .select("*")
            .eq("person_id", person["id"])
            .order("image_number")
            .execute()
        )

        result.append({
            "id": person["id"],
            "name": person["name"],
            "appearance_count": person["appearance_count"],
            "last_seen": person["last_seen"],
            "created_at": person["created_at"],
            "total_images": len(images.data),
            "primary_image": (
                images.data[0]["image_path"]
                if images.data else None
            )
        })

    return result

@router.get("/{person_id}")
def get_person(person_id: str):

    person = (
        supabase.table("persons")
        .select("*")
        .eq("id", person_id)
        .execute()
    )

    if not person.data:
        raise HTTPException(
            status_code=404,
            detail="Person not found"
        )

    images = (
        supabase.table("person_images")
        .select("*")
        .eq("person_id", person_id)
        .order("image_number")
        .execute()
    )

    return {
        "person": person.data[0],
        "images": images.data
    }

@router.put("/{person_id}")
def update_person(
    person_id: str,
    name: str = Form(...)
):

    response = (
        supabase.table("persons")
        .update({
            "name": name
        })
        .eq("id", person_id)
        .execute()
    )

    return {
        "message": "Person updated successfully",
        "person": response.data
    }

@router.delete("/{person_id}")
def delete_person(person_id: str):

    # Get all images
    images = (
        supabase.table("person_images")
        .select("*")
        .eq("person_id", person_id)
        .execute()
    )

    # Delete every image from Storage
    for img in images.data:
        supabase.storage.from_("known_faces").remove(
            [img["image_path"]]
        )

    # Delete the person
    supabase.table("persons")\
        .delete()\
        .eq("id", person_id)\
        .execute()

    return {
        "message": "Person deleted successfully"
    }