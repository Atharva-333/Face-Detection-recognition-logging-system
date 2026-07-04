from pydantic import BaseModel

class PersonCreate(BaseModel):
    name: str