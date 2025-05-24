'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UploadCloud, XCircle, File as FileIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
  className?: string;
}

export default function FileUpload({
  onFilesSelected,
  multiple = false,
  accept,
  maxFiles = 5,
  maxSize = 5, // 5MB default
  className,
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      processFiles(newFiles);
    }
  };

  const processFiles = useCallback((files: File[]) => {
    setError(null);
    let currentFiles = [...selectedFiles];
    
    for (const file of files) {
      if (currentFiles.length >= maxFiles) {
        setError(`Maximum of ${maxFiles} files allowed.`);
        break;
      }
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File "${file.name}" exceeds ${maxSize}MB size limit.`);
        continue; // Skip this file
      }
      currentFiles.push(file);
    }
    
    // Ensure we don't exceed maxFiles overall if multiple selections are made rapidly
    currentFiles = currentFiles.slice(0, maxFiles); 

    setSelectedFiles(currentFiles);
    onFilesSelected(currentFiles);
  }, [selectedFiles, maxFiles, maxSize, onFilesSelected]);


  const handleRemoveFile = (fileName: string) => {
    const updatedFiles = selectedFiles.filter(file => file.name !== fileName);
    setSelectedFiles(updatedFiles);
    onFilesSelected(updatedFiles);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset input to allow re-selection of the same file
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const newFiles = Array.from(event.dataTransfer.files);
      processFiles(newFiles);
      event.dataTransfer.clearData();
    }
  }, [processFiles]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };


  return (
    <div className={cn("space-y-4", className)}>
      <div 
        className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer border-border hover:border-primary transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
      >
        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
        <p className="mb-2 text-sm text-muted-foreground">
          <span className="font-semibold">Click to upload</span> or drag and drop
        </p>
        {accept && <p className="text-xs text-muted-foreground">Accepted: {accept}</p>}
        <p className="text-xs text-muted-foreground">Max {maxFiles} files, up to {maxSize}MB each</p>
        <Input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={accept}
          onChange={handleFileChange}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {selectedFiles.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium">Selected files ({selectedFiles.length}/{maxFiles}):</h4>
          <ScrollArea className="h-32 border rounded-md">
            <div className="p-2 space-y-1">
            {selectedFiles.map(file => (
              <div key={file.name} className="flex items-center justify-between p-2 text-sm rounded-md bg-muted/50">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileIcon className="w-4 h-4 text-muted-foreground shrink-0" /> 
                  <span className="truncate" title={file.name}>{file.name}</span> 
                  <span className="text-xs text-muted-foreground whitespace-nowrap">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(file.name)} className="w-6 h-6">
                  <XCircle className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
