from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.config import CLEANED_DIR
from app.api.schemas import CleaningReport
from cleaning.pipeline import run_cleaning_pipeline, export_cleaned_csv


router = APIRouter(prefix="/cleaning", tags=["cleaning"])


@router.post("/run", response_model=CleaningReport)
def run_cleaning(db: Session = Depends(get_db)):
    report = run_cleaning_pipeline(db)
    return report


@router.get("/report", response_model=CleaningReport | None)
def get_last_report():
    from cleaning.pipeline import LAST_REPORT
    return LAST_REPORT


@router.get("/export")
def export_csv(db: Session = Depends(get_db)):
    path = export_cleaned_csv(db)
    return FileResponse(
        path=path,
        filename="uk_cars_cleaned.csv",
        media_type="text/csv",
    )
