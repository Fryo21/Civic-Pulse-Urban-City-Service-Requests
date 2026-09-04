from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.dashboard import router as dashboard_router
from routes.hotspots import router as hotspot_router
from routes.metadata import router as metadata_router

app = FastAPI(title="CivicPulse API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(metadata_router)
app.include_router(dashboard_router)
app.include_router(hotspot_router)


@app.get("/health")
def health_check():
    return {"status": "healthy"}