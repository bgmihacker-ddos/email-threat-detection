import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeEmail } from '../services/analysisApi';
import { FileUp, X } from 'lucide-react';

export default function AnalyzeEmail() {
  const [emailContent, setEmailContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStage, setCurrentStage] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.eml')) {
        setError('Only .eml files are supported.');
        setFile(null);
      } else {
        setError(null);
        setFile(selectedFile);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
        if (!droppedFile.name.endsWith('.eml')) {
            setError('Only .eml files are supported.');
            setFile(null);
        } else {
            setError(null);
            setFile(droppedFile);
        }
    }
  };

  const handleAnalyze = async () => {
    if (!emailContent && !file) {
        setError('Please paste raw email content or upload an .eml file.');
        return;
    }
    setIsAnalyzing(true);
    setError(null);
    setCurrentStage('PARSING EMAIL');

    try {
        const result = await analyzeEmail(emailContent, file || undefined);
        navigate(`/analysis/${result.analysis_id}`);
    } catch {
        setError('Failed to analyze email. Please try again.');
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-6 space-y-6 text-white max-w-5xl mx-auto">
      <h1 className="text-xl font-bold uppercase tracking-wider">Analyze Email</h1>
      <p className="text-gray-500 text-sm">Upload an .eml file or paste raw email content for forensic analysis.</p>

      {/* File Upload Section */}
      <div className="bg-[#080D14] p-6 border border-[#151D28] rounded space-y-4">
        <h2 className="text-sm font-bold uppercase text-gray-400">Upload .EML File</h2>
        <div
          className="border border-dashed border-[#151D28] p-10 text-center text-gray-500 rounded cursor-pointer hover:border-cyan-500 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {file ? (
              <div className="flex items-center justify-center gap-2">
                  <FileUp size={16} className="text-cyan-500" />
                  <span className="text-white">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
              </div>
          ) : (
              <div className="flex flex-col items-center gap-2">
                <FileUp size={24} className="text-gray-600" />
                <span>DROP .EML FILE HERE OR CLICK BROWSE</span>
              </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".eml" className="hidden" />
        </div>
        <button onClick={() => fileInputRef.current?.click()} className="bg-[#151D28] text-gray-300 px-4 py-2 rounded font-bold text-xs uppercase hover:bg-[#1E2A3D]">Browse File</button>
      </div>

      {/* Raw Email Paste Section */}
      <div className="bg-[#080D14] p-6 border border-[#151D28] rounded space-y-4">
        <h2 className="text-sm font-bold uppercase text-gray-400">Paste Raw Email Content</h2>
        <textarea
          className="w-full h-48 bg-[#0B1120] border border-[#151D28] rounded p-4 text-sm text-gray-300 font-mono resize-y focus:outline-none focus:border-cyan-500 transition-colors"
          placeholder="Paste complete RFC/MIME email content here..."
          value={emailContent}
          onChange={(e) => setEmailContent(e.target.value)}
        />
      </div>

      {/* Error Display */}
      {error && <p className="text-red-500 text-xs">{error}</p>}

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded font-bold text-sm uppercase tracking-wider transition-colors"
      >
        {isAnalyzing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            {currentStage}
          </span>
        ) : (
          'ANALYZE EMAIL'
        )}
      </button>
    </div>
  );
}
