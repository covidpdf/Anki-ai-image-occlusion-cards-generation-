"""Smoke tests for placeholder routers."""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_ocr_placeholder_returns_501():
    response = client.get("/ocr/placeholder")
    assert response.status_code == 501
    assert response.json() == {"message": "OCR functionality not yet implemented"}


def test_decks_placeholder_returns_501():
    response = client.get("/decks/placeholder")
    assert response.status_code == 501
    assert response.json() == {"message": "Deck management functionality not yet implemented"}


def test_export_placeholder_returns_501():
    response = client.get("/export/placeholder")
    assert response.status_code == 501
    assert response.json() == {"message": "Export functionality not yet implemented"}
