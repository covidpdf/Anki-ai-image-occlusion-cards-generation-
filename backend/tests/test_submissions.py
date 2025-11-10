"""Tests for submissions API"""

import pytest
from fastapi.testclient import TestClient
from io import BytesIO

from app.main import app
from app.services import SubmissionService

client = TestClient(app)


@pytest.fixture(autouse=True)
def cleanup():
    """Clean up submissions after each test"""
    yield
    SubmissionService.clear_submissions()


def test_create_submission():
    """Test creating a new submission with file upload"""
    file_content = b"mock pdf content"
    response = client.post(
        "/api/submissions",
        files={"file": ("test.pdf", file_content, "application/pdf")},
    )

    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["filename"] == "test.pdf"
    assert data["status"] == "uploaded"
    assert data["cards"] == []


def test_get_submission():
    """Test retrieving a submission"""
    # Create a submission first
    file_content = b"mock pdf content"
    create_response = client.post(
        "/api/submissions",
        files={"file": ("test.pdf", file_content, "application/pdf")},
    )
    submission_id = create_response.json()["id"]

    # Get the submission
    response = client.get(f"/api/submissions/{submission_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == submission_id
    assert data["filename"] == "test.pdf"


def test_get_submission_not_found():
    """Test getting a non-existent submission"""
    response = client.get("/api/submissions/nonexistent")
    assert response.status_code == 404


def test_generate_cards():
    """Test generating cards from submission"""
    # Create a submission first
    file_content = b"mock pdf content"
    create_response = client.post(
        "/api/submissions",
        files={"file": ("test.pdf", file_content, "application/pdf")},
    )
    submission_id = create_response.json()["id"]

    # Generate cards
    response = client.post(f"/api/submissions/{submission_id}/generate")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "generated"
    assert len(data["cards"]) > 0
    assert "id" in data["cards"][0]
    assert "front_text" in data["cards"][0]
    assert "back_text" in data["cards"][0]
    assert "occlusions" in data["cards"][0]


def test_approve_submission():
    """Test approving and updating cards"""
    # Create and generate cards
    file_content = b"mock pdf content"
    create_response = client.post(
        "/api/submissions",
        files={"file": ("test.pdf", file_content, "application/pdf")},
    )
    submission_id = create_response.json()["id"]

    generate_response = client.post(f"/api/submissions/{submission_id}/generate")
    cards = generate_response.json()["cards"]

    # Update the first card's text
    cards[0]["front_text"] = "Updated Question"
    cards[0]["back_text"] = "Updated Answer"
    cards[0]["approved"] = True

    # Approve submission
    response = client.patch(
        f"/api/submissions/{submission_id}/approve",
        json={"cards": cards, "notes": "Looks good"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "approved"
    assert data["cards"][0]["front_text"] == "Updated Question"
    assert data["cards"][0]["back_text"] == "Updated Answer"
    assert data["cards"][0]["approved"] is True


def test_export_submission():
    """Test exporting submission as .apkg"""
    # Create and approve submission
    file_content = b"mock pdf content"
    create_response = client.post(
        "/api/submissions",
        files={"file": ("test.pdf", file_content, "application/pdf")},
    )
    submission_id = create_response.json()["id"]

    client.post(f"/api/submissions/{submission_id}/generate")

    # Export submission
    response = client.post(f"/api/submissions/{submission_id}/export")

    assert response.status_code == 200
    data = response.json()
    assert "download_url" in data
    assert "filename" in data
    assert data["submission_id"] == submission_id


def test_download_submission():
    """Test downloading exported .apkg file"""
    # Create submission and export
    file_content = b"mock pdf content"
    create_response = client.post(
        "/api/submissions",
        files={"file": ("test.pdf", file_content, "application/pdf")},
    )
    submission_id = create_response.json()["id"]

    # Export submission first
    client.post(f"/api/submissions/{submission_id}/export")

    # Download
    response = client.get(f"/api/submissions/{submission_id}/download")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "filename" in data
