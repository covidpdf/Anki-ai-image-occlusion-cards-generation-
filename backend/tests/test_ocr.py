"""Integration tests for OCR endpoints"""
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestOCRSubmission:
    """Tests for OCR submission endpoint"""

    def test_submit_single_page_ocr(self):
        """Test submitting OCR results for a single page"""
        payload = {
            "filename": "test_image.png",
            "pages": [
                {
                    "pageNumber": 1,
                    "text": "Sample OCR text from image",
                    "confidence": 95.5,
                }
            ],
        }

        response = client.post("/api/ocr/submit", json=payload)
        assert response.status_code == 201

        data = response.json()
        assert "id" in data
        assert data["filename"] == "test_image.png"
        assert data["pageCount"] == 1
        assert data["totalConfidence"] == 95.5
        assert "createdAt" in data

    def test_submit_multi_page_pdf_ocr(self):
        """Test submitting OCR results for a multi-page PDF document"""
        payload = {
            "filename": "anatomy_textbook.pdf",
            "pages": [
                {
                    "pageNumber": 1,
                    "text": "Chapter 1: Introduction to Human Anatomy\n\nThe human body...",
                    "confidence": 92.3,
                },
                {
                    "pageNumber": 2,
                    "text": "The skeletal system provides structure and support...",
                    "confidence": 94.7,
                },
                {
                    "pageNumber": 3,
                    "text": "Major bone groups include: cranium, vertebral column...",
                    "confidence": 91.2,
                },
                {
                    "pageNumber": 4,
                    "text": "Figure 1.1: Cross-section of the femur\nLabel A: Cortical bone...",
                    "confidence": 88.5,
                },
                {
                    "pageNumber": 5,
                    "text": "The muscular system works in conjunction with...",
                    "confidence": 93.8,
                },
            ],
        }

        response = client.post("/api/ocr/submit", json=payload)
        assert response.status_code == 201

        data = response.json()
        assert "id" in data
        assert data["filename"] == "anatomy_textbook.pdf"
        assert data["pageCount"] == 5
        expected_avg_confidence = sum(p["confidence"] for p in payload["pages"]) / 5
        assert abs(data["totalConfidence"] - expected_avg_confidence) < 0.01
        assert "createdAt" in data

    def test_submit_large_anatomy_image_with_complex_text(self):
        """Test submitting OCR results from a large anatomy diagram with detailed labels"""
        complex_anatomy_text = """
        ANATOMICAL STRUCTURES OF THE HEART

        Superior Vena Cava (SVC)
        Right Atrium
        Tricuspid Valve
        Right Ventricle
        Pulmonary Valve
        Pulmonary Artery
        Left Pulmonary Veins
        Right Pulmonary Veins
        Left Atrium
        Mitral Valve (Bicuspid)
        Left Ventricle
        Aortic Valve
        Ascending Aorta
        Aortic Arch
        Descending Aorta
        Inferior Vena Cava (IVC)

        Coronary Arteries:
        - Left Main Coronary Artery (LMCA)
        - Left Anterior Descending (LAD)
        - Left Circumflex (LCx)
        - Right Coronary Artery (RCA)

        Cardiac Chambers:
        Right Side (Deoxygenated Blood):
        - Right Atrium receives blood from SVC and IVC
        - Right Ventricle pumps blood to lungs via pulmonary artery

        Left Side (Oxygenated Blood):
        - Left Atrium receives blood from pulmonary veins
        - Left Ventricle pumps blood to body via aorta

        Figure 2.3: Anterior view of the heart showing major vessels and chambers
        Scale: 1:2 (actual size approx. 12cm x 8cm x 6cm)
        """

        payload = {
            "filename": "cardiac_anatomy_large_4k.png",
            "pages": [
                {
                    "pageNumber": 1,
                    "text": complex_anatomy_text,
                    "confidence": 87.9,
                }
            ],
        }

        response = client.post("/api/ocr/submit", json=payload)
        assert response.status_code == 201

        data = response.json()
        assert "id" in data
        assert data["filename"] == "cardiac_anatomy_large_4k.png"
        assert data["pageCount"] == 1
        assert data["totalConfidence"] == 87.9

    def test_submit_medical_diagram_with_special_characters(self):
        """Test OCR submission with medical terminology and special characters"""
        payload = {
            "filename": "medical_symbols.png",
            "pages": [
                {
                    "pageNumber": 1,
                    "text": "Temperature: 37°C (98.6°F)\nBlood Pressure: 120/80 mmHg\nHeart Rate: 72 bpm\nO₂ Saturation: 98%\nGlucose: 5.5 mmol/L\nCa²⁺: 2.4 mmol/L",
                    "confidence": 89.2,
                }
            ],
        }

        response = client.post("/api/ocr/submit", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["pageCount"] == 1

    def test_submit_empty_pages_list_should_fail(self):
        """Test that submitting with empty pages list fails validation"""
        payload = {"filename": "empty.pdf", "pages": []}

        response = client.post("/api/ocr/submit", json=payload)
        assert response.status_code == 422

    def test_submit_invalid_confidence_should_fail(self):
        """Test that confidence values outside 0-100 range fail validation"""
        payload = {
            "filename": "test.pdf",
            "pages": [
                {
                    "pageNumber": 1,
                    "text": "Test text",
                    "confidence": 150.0,
                }
            ],
        }

        response = client.post("/api/ocr/submit", json=payload)
        assert response.status_code == 422

    def test_submit_negative_page_number_should_fail(self):
        """Test that negative page numbers fail validation"""
        payload = {
            "filename": "test.pdf",
            "pages": [
                {
                    "pageNumber": 0,
                    "text": "Test text",
                    "confidence": 95.0,
                }
            ],
        }

        response = client.post("/api/ocr/submit", json=payload)
        assert response.status_code == 422

    def test_submit_empty_filename_should_fail(self):
        """Test that empty filename fails validation"""
        payload = {
            "filename": "",
            "pages": [
                {
                    "pageNumber": 1,
                    "text": "Test text",
                    "confidence": 95.0,
                }
            ],
        }

        response = client.post("/api/ocr/submit", json=payload)
        assert response.status_code == 422


class TestOCRRetrieval:
    """Tests for retrieving OCR submissions"""

    def test_retrieve_submission_by_id(self):
        """Test retrieving a specific submission by its ID"""
        payload = {
            "filename": "retrieval_test.pdf",
            "pages": [
                {
                    "pageNumber": 1,
                    "text": "Test content for retrieval",
                    "confidence": 90.0,
                }
            ],
        }

        submit_response = client.post("/api/ocr/submit", json=payload)
        assert submit_response.status_code == 201
        submission_id = submit_response.json()["id"]

        retrieve_response = client.get(f"/api/ocr/submissions/{submission_id}")
        assert retrieve_response.status_code == 200

        data = retrieve_response.json()
        assert "request" in data
        assert "response" in data
        assert data["request"]["filename"] == "retrieval_test.pdf"

    def test_retrieve_nonexistent_submission_should_404(self):
        """Test that retrieving a non-existent submission returns 404"""
        response = client.get("/api/ocr/submissions/nonexistent-id")
        assert response.status_code == 404

    def test_list_all_submissions(self):
        """Test listing all submissions"""
        response = client.get("/api/ocr/submissions")
        assert response.status_code == 200

        data = response.json()
        assert "submissions" in data
        assert "count" in data
        assert isinstance(data["submissions"], list)
        assert data["count"] >= 0


class TestLargeDocumentProcessing:
    """Tests for processing large documents (anatomy textbooks, medical journals)"""

    def test_submit_50_page_medical_textbook(self):
        """Test submitting a large 50-page medical textbook"""
        pages = []
        for i in range(1, 51):
            pages.append(
                {
                    "pageNumber": i,
                    "text": f"Page {i}: Anatomical structures and medical terminology...",
                    "confidence": 90.0 + (i % 10),
                }
            )

        payload = {"filename": "gray_anatomy_textbook.pdf", "pages": pages}

        response = client.post("/api/ocr/submit", json=payload)
        assert response.status_code == 201

        data = response.json()
        assert data["pageCount"] == 50
        assert 90.0 <= data["totalConfidence"] <= 100.0

    def test_submit_high_resolution_anatomy_poster(self):
        """Test submitting a very large, high-resolution anatomy poster with hundreds of labels"""
        labels = []
        for i in range(1, 201):
            labels.append(f"Structure_{i}: Anatomical feature {i}")

        large_text = "\n".join(labels)
        large_text += "\n\nNote: This is a 8000x6000px high-resolution medical poster"
        large_text += "\nUsed for medical education and examination preparation"

        payload = {
            "filename": "complete_human_anatomy_8k.png",
            "pages": [
                {
                    "pageNumber": 1,
                    "text": large_text,
                    "confidence": 85.7,
                }
            ],
        }

        response = client.post("/api/ocr/submit", json=payload)
        assert response.status_code == 201

        data = response.json()
        assert len(payload["pages"][0]["text"]) > 1000
        assert data["pageCount"] == 1


class TestEdgeCases:
    """Tests for edge cases in OCR processing"""

    def test_submit_ocr_with_very_low_confidence(self):
        """Test submitting OCR with very low confidence scores"""
        payload = {
            "filename": "blurry_image.jpg",
            "pages": [
                {
                    "pageNumber": 1,
                    "text": "Barely readable text due to poor image quality",
                    "confidence": 45.2,
                }
            ],
        }

        response = client.post("/api/ocr/submit", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["totalConfidence"] == 45.2

    def test_submit_ocr_with_unicode_medical_symbols(self):
        """Test OCR with various Unicode medical symbols"""
        payload = {
            "filename": "unicode_medical.pdf",
            "pages": [
                {
                    "pageNumber": 1,
                    "text": "♀ Female ♂ Male ☤ Caduceus ⚕ Staff of Asclepius\n℞ Prescription\n△ Triangle warning\n⚠ Caution symbol",
                    "confidence": 82.3,
                }
            ],
        }

        response = client.post("/api/ocr/submit", json=payload)
        assert response.status_code == 201

    def test_submit_ocr_with_empty_text(self):
        """Test submitting OCR with empty text (blank page)"""
        payload = {
            "filename": "blank_page.pdf",
            "pages": [
                {
                    "pageNumber": 1,
                    "text": "",
                    "confidence": 100.0,
                }
            ],
        }

        response = client.post("/api/ocr/submit", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["pageCount"] == 1

    def test_submit_mixed_confidence_pages(self):
        """Test document with pages of varying OCR quality"""
        payload = {
            "filename": "mixed_quality.pdf",
            "pages": [
                {
                    "pageNumber": 1,
                    "text": "Crystal clear page",
                    "confidence": 99.8,
                },
                {
                    "pageNumber": 2,
                    "text": "Slightly blurry page",
                    "confidence": 82.4,
                },
                {
                    "pageNumber": 3,
                    "text": "Very poor quality scan",
                    "confidence": 51.2,
                },
                {
                    "pageNumber": 4,
                    "text": "Good quality page",
                    "confidence": 95.1,
                },
            ],
        }

        response = client.post("/api/ocr/submit", json=payload)
        assert response.status_code == 201

        data = response.json()
        expected_avg = (99.8 + 82.4 + 51.2 + 95.1) / 4
        assert abs(data["totalConfidence"] - expected_avg) < 0.01
