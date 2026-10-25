export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ACCEPTED_EXTENSIONS = ['pdf', 'docx', 'txt', 'md'];
export const ACCEPTED_FILE_TYPES = '.pdf,.docx,.txt,.md';

export function getFileExtension(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot < 0 ? '' : fileName.slice(dot + 1).toLowerCase();
}

export function validateUploadFile(file: File | null | undefined): string | null {
  if (!file) return 'Seleccioná un archivo';
  if (file.size === 0) return 'El archivo está vacío';
  if (!ACCEPTED_EXTENSIONS.includes(getFileExtension(file.name))) {
    return 'Formato no soportado. Usá PDF, DOCX, TXT o MD';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `El archivo no puede superar los ${MAX_FILE_SIZE_MB} MB`;
  }
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
