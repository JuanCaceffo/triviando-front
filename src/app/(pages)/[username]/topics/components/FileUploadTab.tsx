'use client';

import { useRef, useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  ACCEPTED_FILE_TYPES,
  MAX_FILE_SIZE_MB,
  formatFileSize,
  validateUploadFile,
} from '../utils/fileValidation';

interface FileUploadTabProps {
  onSubmit: (name: string, file: File) => void;
  onCancel: () => void;
}

interface FormErrors {
  name?: string;
  file?: string;
}

export default function FileUploadTab({ onSubmit, onCancel }: FileUploadTabProps) {
  const [topicName, setTopicName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = (selected: File | null | undefined) => {
    if (!selected) {
      setFile(null);
      return;
    }
    const error = validateUploadFile(selected);
    if (error) {
      setFile(null);
      setErrors((previous) => ({ ...previous, file: error }));
      return;
    }
    setFile(selected);
    setErrors((previous) => ({ ...previous, file: undefined }));
  };

  const clearFile = () => {
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (!topicName.trim()) {
      nextErrors.name = 'El nombre del tema es obligatorio';
    }
    const fileError = validateUploadFile(file);
    if (fileError) {
      nextErrors.file = fileError;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    if (!file) {
      return;
    }

    onSubmit(topicName.trim(), file);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="file-topic-name" className="text-cyan-700">
            Nombre del tema
          </Label>
          <Input
            id="file-topic-name"
            placeholder="Ej: Biología celular"
            value={topicName}
            onChange={(event) => {
              setTopicName(event.target.value);
              if (errors.name) {
                setErrors((previous) => ({ ...previous, name: undefined }));
              }
            }}
            className={`border-cyan-200 focus:border-cyan-400 ${
              errors.name ? 'border-red-500' : ''
            }`}
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="document-file" className="text-cyan-700">
            Archivo
          </Label>
          <input
            ref={inputRef}
            id="document-file"
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            className="hidden"
            onChange={(event) => pickFile(event.target.files?.[0])}
          />

          {file ? (
            <div className="flex items-center justify-between gap-3 rounded-md border border-cyan-200 bg-cyan-50/60 px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-5 w-5 shrink-0 text-cyan-600" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-cyan-800">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Quitar archivo"
                onClick={clearFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <label
              htmlFor="document-file"
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                pickFile(event.dataTransfer.files?.[0]);
              }}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-center transition-colors ${
                dragging
                  ? 'border-cyan-500 bg-cyan-50'
                  : 'border-cyan-200 hover:border-cyan-400 hover:bg-cyan-50/50'
              }`}
            >
              <Upload className="h-6 w-6 text-cyan-500" />
              <span className="text-sm font-medium text-cyan-700">
                Arrastrá el archivo o hacé clic para seleccionarlo
              </span>
              <span className="text-xs text-muted-foreground">
                PDF, DOCX, TXT o MD · máximo {MAX_FILE_SIZE_MB} MB
              </span>
            </label>
          )}
          {errors.file && <p className="text-red-500 text-xs">{errors.file}</p>}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="border-cyan-200 hover:bg-cyan-50 text-cyan-700"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white"
        >
          <Upload className="mr-2 h-4 w-4" />
          Generar desde archivo
        </Button>
      </div>
    </form>
  );
}
