import { useState } from 'react';
import './App.css';
import { apiClient, Submission, Card } from './services/api';
import { UploadStep } from './components/UploadStep';
import { CardReview } from './components/CardReview';
import { WorkflowStepper } from './components/WorkflowStepper';

type WorkflowStep = 'upload' | 'generate' | 'review' | 'export' | 'download';

function App() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  const steps = ['Upload', 'Generate', 'Review', 'Export', 'Download'];
  const stepMap: Record<WorkflowStep, number> = {
    upload: 0,
    generate: 1,
    review: 2,
    export: 3,
    download: 4,
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await apiClient.createSubmission(file);
      setSubmission(result);
      setCurrentStep('generate');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCards = async () => {
    if (!submission) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await apiClient.generateCards(submission.id);
      setSubmission(result);
      setCards(result.cards);
      setCurrentStep('review');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Card generation failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveCards = async () => {
    if (!submission) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await apiClient.approveSubmission(submission.id, cards);
      setSubmission(result);
      setCurrentStep('export');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Approval failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!submission) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await apiClient.exportSubmission(submission.id);
      setDownloadUrl(result.download_url);
      setCurrentStep('download');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!submission || !downloadUrl) return;

    setIsLoading(true);
    setError('');

    try {
      const data = await apiClient.downloadSubmission(submission.id);

      // Create a blob from the base64 data and trigger download
      const binaryString = atob(data.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/octet-stream' });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Download failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardChange = (index: number, updatedCard: Card) => {
    const newCards = [...cards];
    newCards[index] = updatedCard;
    setCards(newCards);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Anki Image Occlusion Generator</h1>
        <p>Convert your PDFs into Anki flashcards with AI-powered occlusions</p>
      </header>

      <WorkflowStepper currentStep={stepMap[currentStep]} steps={steps} />

      <main className="app-content">
        {currentStep === 'upload' && (
          <UploadStep onFileUpload={handleFileUpload} isLoading={isLoading} error={error} />
        )}

        {currentStep === 'generate' && submission && (
          <div className="step">
            <h2>Step 2: Generate Cards</h2>
            <p>AI will analyze your PDF and generate flashcards with occlusions.</p>
            <button onClick={handleGenerateCards} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Cards'}
            </button>
            {error && <div className="error-message">{error}</div>}
          </div>
        )}

        {currentStep === 'review' && (
          <div className="step">
            <h2>Step 3: Review & Approve Cards</h2>
            <div className="cards-container">
              {cards.map((card, index) => (
                <CardReview
                  key={card.id || index}
                  card={card}
                  index={index}
                  isApproved={submission?.status === 'approved'}
                  onChange={(updated) => handleCardChange(index, updated)}
                />
              ))}
            </div>
            <div className="action-buttons">
              <button onClick={handleApproveCards} disabled={isLoading}>
                {isLoading ? 'Approving...' : 'Approve & Continue'}
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
          </div>
        )}

        {currentStep === 'export' && (
          <div className="step">
            <h2>Step 4: Export Deck</h2>
            <p>Ready to export your deck as an Anki-compatible .apkg file.</p>
            <button onClick={handleExport} disabled={isLoading}>
              {isLoading ? 'Exporting...' : 'Export to Anki'}
            </button>
            {error && <div className="error-message">{error}</div>}
          </div>
        )}

        {currentStep === 'download' && (
          <div className="step">
            <h2>Step 5: Download Deck</h2>
            <p>Your deck is ready for download!</p>
            <button onClick={handleDownload} disabled={isLoading}>
              {isLoading ? 'Downloading...' : 'Download Deck'}
            </button>
            {error && <div className="error-message">{error}</div>}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
