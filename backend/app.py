from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routes.persons import router as person_router
from routes.detections import router as detections_router
from routes.recognize import router as recognize_router

app = FastAPI(
    title="Face Recognition API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/cache",
    StaticFiles(directory=str(Path(__file__).resolve().parent / "cache")),
    name="cache"
)

app.include_router(person_router)
app.include_router(detections_router)
app.include_router(recognize_router)


@app.get("/")
def home():
    return {
        "message": "Backend Running"
    }