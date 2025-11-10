import { useState, useCallback } from 'react';
import { FileUpload } from '../components/FileUpload';
import { Stepper } from '../components/Stepper';
import { OCRViewer } from '../components/OCRViewer';
import { pdfRenderer } from '../services/pdfRenderer';
import { ocrService } from '../services/ocrService';
import { apiClient } from '../services/api';
import type { UploadedFile, WizardStep, PageOCRResult } from '../types/ocr';

const WIZARD_STEPS = [
  { label: 'Upload', description: 'Select PDF or image file' },
  { label: 'Process', description: 'OCR processing' },
  { label: 'Review', description: 'Review and edit text' },
  { label: 'Submit', description: 'Submit for AI processing' },
];

export const UploadWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<WizardStep>(0);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [processing, setProcessing] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setProcessing(true);
    try {
      const pages = await pdfRenderer.processFile(file);

      const uploadedFile: UploadedFile = {
        file,
        name: file.name,
        type: file.type,
        size: file.size,
        pages: pages.map((page) => ({
          pageNumber: page.pageNumber,
          imageData: page.imageData,
          ocrResult: null,
          status: 'pending' as const,
        })),
      };

      setUploadedFile(uploadedFile);
      setCurrentStep(1);
      await processOCR(uploadedFile);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Failed to process file. Please try again.');
    } finally {
      setProcessing(false);
    }
  }, []);

  const processOCR = async (file: UploadedFile) => {
    setProcessing(true);

    try {
      await ocrService.initialize();

      for (let i = 0; i < file.pages.length; i++) {
        const page = file.pages[i];
        
        setUploadedFile((prev) => {
          if (!prev) return prev;
          const newPages = [...prev.pages];
          newPages[i] = { ...newPages[i], status: 'processing' };
          return { ...prev, pages: newPages };
        });

        try {
          const ocrResult = await ocrService.recognizeImage(page.imageData);

          setUploadedFile((prev) => {
            if (!prev) return prev;
            const newPages = [...prev.pages];
            newPages[i] = {
              ...newPages[i],
              ocrResult,
              status: 'completed',
            };
            return { ...prev, pages: newPages };
          });
        } catch (error) {
          console.error(`Error processing page ${page.pageNumber}:`, error);
          setUploadedFile((prev) => {
            if (!prev) return prev;
            const newPages = [...prev.pages];
            newPages[i] = {
              ...newPages[i],
              status: 'error',
              error: 'OCR processing failed',
            };
            return { ...prev, pages: newPages };
          });
        }
      }

      setCurrentStep(2);
    } catch (error) {
      console.error('OCR initialization error:', error);
      alert('Failed to initialize OCR. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleTextEdit = useCallback((pageIndex: number, newText: string) => {
    setUploadedFile((prev) => {
      if (!prev) return prev;
      const newPages = [...prev.pages];
      if (newPages[pageIndex].ocrResult) {
        newPages[pageIndex] = {
          ...newPages[pageIndex],
          ocrResult: {
            ...newPages[pageIndex].ocrResult!,
            text: newText,
          },
        };
      }
      return { ...prev, pages: newPages };
    });
  }, []);

  const handleSubmit = async () => {
    if (!uploadedFile) return;

    setSubmitStatus('submitting');
    setSubmitError(null);

    try {
      const submission = {
        filename: uploadedFile.name,
        pages: uploadedFile.pages
          .filter((p) => p.ocrResult)
          .map((p) => ({
            pageNumber: p.pageNumber,
            text: p.ocrResult!.text,
            confidence: p.ocrResult!.confidence,
          })),
      };

      await apiClient.submitOCR(submission);
      setSubmitStatus('success');
      setCurrentStep(3);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit');
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setCurrentStep(0);
    setCurrentPageIndex(0);
    setSubmitStatus('idle');
    setSubmitError(null);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="wizard-step">
            <h2>Upload Document</h2>
            <FileUpload onFileSelect={handleFileSelect} />
          </div>
        );

      case 1:
        return (
          <div className="wizard-step">
            <h2>Processing OCR</h2>
            {uploadedFile && (
              <div className="processing-status">
                <div className="processing-info">
                  <p>File: {uploadedFile.name}</p>
                  <p>Pages: {uploadedFile.pages.length}</p>
                  <p>
                    Completed:{' '}
                    {uploadedFile.pages.filter((p) => p.status === 'completed').length} /{' '}
                    {uploadedFile.pages.length}
                  </p>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(uploadedFile.pages.filter((p) => p.status === 'completed').length / uploadedFile.pages.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="wizard-step">
            <h2>Review and Edit</h2>
            {uploadedFile && (
              <>
                {uploadedFile.pages.length > 1 && (
                  <div className="page-navigation">
                    <button
                      onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                      disabled={currentPageIndex === 0}
                      className="nav-button"
                    >
                      Previous Page
                    </button>
                    <span className="page-indicator">
                      Page {currentPageIndex + 1} of {uploadedFile.pages.length}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPageIndex(
                          Math.min(uploadedFile.pages.length - 1, currentPageIndex + 1)
                        )
                      }
                      disabled={currentPageIndex === uploadedFile.pages.length - 1}
                      className="nav-button"
                    >
                      Next Page
                    </button>
                  </div>
                )}
                <OCRViewer
                  page={uploadedFile.pages[currentPageIndex]}
                  onTextEdit={(text) => handleTextEdit(currentPageIndex, text)}
                />
                <div className="wizard-actions">
                  <button onClick={handleReset} className="button button-secondary">
                    Start Over
                  </button>
                  <button onClick={handleSubmit} className="button button-primary">
                    Submit for Processing
                  </button>
                </div>
              </>
            )}
          </div>
        );

      case 3:
        return (
          <div className="wizard-step">
            <h2>Submission Complete</h2>
            {submitStatus === 'success' && (
              <div className="success-message">
                <svg
                  className="success-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p>Your document has been successfully submitted for AI processing!</p>
                <p className="success-details">
                  File: {uploadedFile?.name}
                  <br />
                  Pages processed: {uploadedFile?.pages.length}
                </p>
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="error-message">
                <p>Failed to submit: {submitError}</p>
              </div>
            )}
            <button onClick={handleReset} className="button button-primary">
              Upload Another Document
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="upload-wizard">
      <div className="wizard-header">
        <h1>OCR Upload Wizard</h1>
        <Stepper steps={WIZARD_STEPS} currentStep={currentStep} />
      </div>

      <div className="wizard-content">
        {processing && currentStep === 0 && (
          <div className="loading-overlay">
            <div className="spinner" />
            <p>Processing file...</p>
          </div>
        )}
        {renderStepContent()}
      </div>
    </div>
  );
};
