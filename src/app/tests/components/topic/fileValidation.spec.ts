import {
  MAX_FILE_SIZE_BYTES,
  formatFileSize,
  getFileExtension,
  validateUploadFile,
} from '@/app/(pages)/[username]/topics/utils/fileValidation';

const createFile = (name: string, content = 'contenido') =>
  new File([content], name, { type: 'application/octet-stream' });

const createFileWithSize = (name: string, size: number) => {
  const file = createFile(name);
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('fileValidation', () => {
  describe('getFileExtension', () => {
    it('devuelve la extensión en minúsculas', () => {
      expect(getFileExtension('Apunte.PDF')).toBe('pdf');
    });

    it('devuelve vacío si no hay extensión', () => {
      expect(getFileExtension('sin-extension')).toBe('');
    });
  });

  describe('validateUploadFile', () => {
    it.each(['apunte.pdf', 'apunte.docx', 'apunte.txt', 'apunte.md'])(
      'acepta el archivo válido %s',
      (name) => {
        expect(validateUploadFile(createFile(name))).toBeNull();
      },
    );

    it('rechaza un archivo nulo', () => {
      expect(validateUploadFile(null)).toBe('Seleccioná un archivo');
    });

    it('rechaza un archivo vacío', () => {
      expect(validateUploadFile(createFileWithSize('apunte.txt', 0))).toBe(
        'El archivo está vacío',
      );
    });

    it('rechaza una extensión no soportada', () => {
      expect(validateUploadFile(createFile('planilla.xlsx'))).toBe(
        'Formato no soportado. Usá PDF, DOCX, TXT o MD',
      );
    });

    it('rechaza un archivo que supera los 10 MB', () => {
      const file = createFileWithSize('apunte.pdf', MAX_FILE_SIZE_BYTES + 1);
      expect(validateUploadFile(file)).toBe('El archivo no puede superar los 10 MB');
    });

    it('acepta un archivo justo en el límite', () => {
      const file = createFileWithSize('apunte.pdf', MAX_FILE_SIZE_BYTES);
      expect(validateUploadFile(file)).toBeNull();
    });
  });

  describe('formatFileSize', () => {
    it('formatea bytes', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('formatea kilobytes', () => {
      expect(formatFileSize(2048)).toBe('2.0 KB');
    });

    it('formatea megabytes', () => {
      expect(formatFileSize(2 * 1024 * 1024)).toBe('2.0 MB');
    });
  });
});
