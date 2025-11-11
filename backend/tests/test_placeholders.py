"""Tests for placeholder API endpoints."""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_ocr_placeholder() -> None:
    response = client.get("/ocr/placeholder")

    assert response.status_code == 501
    assert response.json() == {
        "message": "OCR endpoint not yet implemented",
        "feature": "ocr",
    }


def test_decks_placeholder() -> None:
    response = client.get("/decks/placeholder")

    assert response.status_code == 501
    assert response.json() == {
        "message": "Deck management not yet implemented",
        "feature": "decks",
    }


def test_export_placeholder() -> None:
    response = client.get("/export/placeholder")

    assert response.status_code == 501
    assert response.json() == {
        "message": "Export endpoint not yet implemented",
        "feature": "export",
    }
