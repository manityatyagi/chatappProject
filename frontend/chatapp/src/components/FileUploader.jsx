import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Check, AlertCircle } from 'lucide-react';
import { cn } from '../libs/utils';
import api from '../api/axios';

const FileUploader = ({ isOpen, onClose, onUploadComplete }) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      const validTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; 
    });
    
    setFiles(prev => [...prev, ...validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending'
    }))]);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const processFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    const processedDocuments = [];

    for (const fileItem of files) {
      try {
        setUploadProgress(prev => ({ ...prev, [fileItem.id]: 0 }));

        const text = await readFileAsText(fileItem.file);


        const { data } = await api.post('/api/ai/process-document', {
          text,
          metadata: {
            fileName: fileItem.file.name,
            fileSize: fileItem.file.size,
            fileType: fileItem.file.type
          }
        });

        processedDocuments.push(...data.chunks);
        setUploadProgress(prev => ({ ...prev, [fileItem.id]: 100 }));
        
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'completed' } : f
        ));
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'error' } : f
        ));
      }
    }

    setUploading(false);
    onUploadComplete?.(processedDocuments);
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
   
     <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-secondary-900">Upload Documents</h2>
              <p className="text-sm text-secondary-500">For AI knowledge base (RAG)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>


        <div className="p-6 space-y-6">

          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
              dragActive ? "border-blue-400 bg-blue-50" : "border-secondary-300 hover:border-secondary-400"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              Drop files here or click to browse
            </h3>
            <p className="text-sm text-secondary-600 mb-4">
              Supports: TXT, PDF, DOC, DOCX (Max 10MB each)
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary px-6 py-2"
            >
              Choose Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.pdf,.doc,.docx"
              onChange={(e) => handleFiles(Array.from(e.target.files))}
              className="hidden"
            />
          </div>


          {files.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-secondary-900">Selected Files</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((fileItem) => (
                  <div key={fileItem.id} className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg">
                    <FileText className="w-5 h-5 text-secondary-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900 truncate">
                        {fileItem.file.name}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {uploadProgress[fileItem.id] !== undefined && (
                        <div className="w-full bg-secondary-200 rounded-full h-1 mt-1">
                          <div 
                            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[fileItem.id]}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {fileItem.status === 'completed' && (
                        <Check className="w-4 h-4 text-success-600" />
                      )}
                      {fileItem.status === 'error' && (
                        <AlertCircle className="w-4 h-4 text-error-600" />
                      )}
                      <button
                        onClick={() => removeFile(fileItem.id)}
                        disabled={uploading}
                        className="p-1 rounded text-secondary-400 hover:text-secondary-600 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {files.length > 0 && (
            <div className="flex space-x-3">
              <button
                onClick={processFiles}
                disabled={uploading || files.length === 0}
                className={cn(
                  "flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-200",
                  !uploading && files.length > 0
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
                    : "bg-secondary-100 text-secondary-400 cursor-not-allowed"
                )}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Process Files</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setFiles([])}
                disabled={uploading}
                className="px-4 py-3 rounded-xl border border-secondary-300 text-secondary-700 hover:bg-secondary-50 disabled:opacity-50"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
