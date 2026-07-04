import os
import sys

sys.path.append(
    os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            ".."
        )
    )
)

from database import supabase

CACHE_FOLDER = "cache"

os.makedirs(CACHE_FOLDER, exist_ok=True)


def sync_faces():
    persons = (
        supabase.table("persons")
        .select("*")
        .execute()
    )

    for person in persons.data:
        person_id = person["id"]

        person_folder = os.path.join(
            CACHE_FOLDER,
            person_id
        )

        os.makedirs(
            person_folder,
            exist_ok=True
        )

        images = (
            supabase.table("person_images")
            .select("*")
            .eq("person_id", person_id)
            .order("image_number")
            .execute()
        )

        print(images.data)

        for image in images.data:
            storage_path = image["image_path"]
            file_name = os.path.basename(storage_path)
            local_path = os.path.join(
                person_folder,
                file_name
            )
            if not os.path.exists(local_path):
                file_bytes = (
                    supabase.storage
                    .from_("known_faces")
                    .download(storage_path)
                )

                with open(local_path, "wb") as f:
                    f.write(file_bytes)

                print(f"Downloaded: {local_path}")

            else:
                print(f"Already exists: {local_path}")

if __name__ == "__main__":
    sync_faces()