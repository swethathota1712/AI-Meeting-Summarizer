import { useState, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileUploaded: (content: string, filename: string) => void;
  onNext: () => void;
}

export function FileUpload({ onFileUploaded, onNext }: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validExtensions = ['.txt', '.docx'];
    const isValidType = validTypes.includes(file.type) || validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt or .docx file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('transcript', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const result = await response.json();
      setUploadedFile({ name: result.filename, size: result.size });
      onFileUploaded(result.content, result.filename);
      
      toast({
        title: "File uploaded successfully",
        description: `${result.filename} has been processed`
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="glass-card p-8 animate-fade-in" data-testid="file-upload-section">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
          <Upload className="text-white text-lg" />
        </div>
        <div>
          <h2 className="text-xl font-bold shimmer-text">Upload Meeting Transcript</h2>
          <p className="text-sm text-muted-foreground">Start by uploading your meeting notes</p>
        </div>
      </div>
      
      <div 
        className="border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 hover:animate-glow transition-all duration-300 cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        data-testid="upload-zone"
      >
        <div className="relative">
          <Upload className="w-16 h-16 text-purple-400 mx-auto mb-6 animate-bounce" />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
            </div>
          )}
        </div>
        <p className="text-xl font-bold text-gray-800 mb-3">
          {isUploading ? "Processing your file..." : "Drop your transcript file here"}
        </p>
        <p className="text-gray-600 mb-4">or click to browse files from your device</p>
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>.txt files</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>.docx files</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Up to 10MB</span>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.docx"
          className="hidden"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
          data-testid="file-input"
        />
      </div>

      {uploadedFile && (
        <div className="mt-6 animate-slide-up" data-testid="file-preview">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                <FileText className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-800">{uploadedFile.name}</p>
                <p className="text-sm text-green-600">
                  {(uploadedFile.size / 1024).toFixed(1)} KB • File uploaded successfully
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded-xl transition-all duration-200"
              data-testid="button-remove-file"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-8">
        <Button
          onClick={onNext}
          disabled={!uploadedFile || isUploading}
          className="btn-gradient-primary px-8 py-3 font-semibold rounded-xl hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          data-testid="button-continue-to-prompt"
        >
          Continue to Instructions
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
