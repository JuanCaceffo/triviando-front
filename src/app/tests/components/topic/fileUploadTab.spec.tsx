import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import FileUploadTab from '@/app/(pages)/[username]/topics/components/FileUploadTab';
import { MAX_FILE_SIZE_BYTES } from '@/app/(pages)/[username]/topics/utils/fileValidation';

const createFile = (name: string, content = 'contenido del archivo') =>
  new File([content], name, { type: 'text/plain' });

const selectFile = (file: File) => {
  fireEvent.change(screen.getByLabelText('Archivo'), { target: { files: [file] } });
};

const typeTopic = (value: string) => {
  fireEvent.change(screen.getByLabelText('Nombre del tema'), { target: { value } });
};

describe('FileUploadTab', () => {
  const onSubmit = jest.fn();
  const onCancel = jest.fn();

  const setup = () => render(<FileUploadTab onSubmit={onSubmit} onCancel={onCancel} />);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza el formulario y el límite de tamaño', () => {
    setup();

    expect(screen.getByLabelText('Nombre del tema')).toBeInTheDocument();
    expect(screen.getByLabelText('Archivo')).toBeInTheDocument();
    expect(screen.getByText(/PDF, DOCX, TXT o MD/)).toBeInTheDocument();
    expect(screen.getByText(/máximo 10 MB/)).toBeInTheDocument();
  });

  it('valida que el nombre y el archivo sean obligatorios', () => {
    setup();

    fireEvent.click(screen.getByText('Generar desde archivo'));

    expect(screen.getByText('El nombre del tema es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('Seleccioná un archivo')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('muestra el nombre y el tamaño del archivo seleccionado', () => {
    setup();
    const file = createFile('apunte.pdf');

    selectFile(file);

    expect(screen.getByText('apunte.pdf')).toBeInTheDocument();
    expect(screen.getByText(`${file.size} B`)).toBeInTheDocument();
  });

  it('rechaza extensiones no soportadas', () => {
    setup();

    selectFile(createFile('planilla.xlsx'));

    expect(screen.getByText('Formato no soportado. Usá PDF, DOCX, TXT o MD')).toBeInTheDocument();
    expect(screen.queryByText('planilla.xlsx')).not.toBeInTheDocument();
  });

  it('rechaza archivos que superan los 10 MB', () => {
    setup();
    const file = createFile('apunte.pdf');
    Object.defineProperty(file, 'size', { value: MAX_FILE_SIZE_BYTES + 1 });

    selectFile(file);

    expect(screen.getByText('El archivo no puede superar los 10 MB')).toBeInTheDocument();
  });

  it('envía el nombre y el archivo cuando el formulario es válido', () => {
    setup();
    const file = createFile('apunte.txt');

    typeTopic('Biología');
    selectFile(file);
    fireEvent.click(screen.getByText('Generar desde archivo'));

    expect(onSubmit).toHaveBeenCalledWith('Biología', file);
  });

  it('limpia el archivo seleccionado', () => {
    setup();
    selectFile(createFile('apunte.txt'));

    fireEvent.click(screen.getByLabelText('Quitar archivo'));

    expect(screen.queryByText('apunte.txt')).not.toBeInTheDocument();
    expect(screen.getByText(/Arrastrá el archivo/)).toBeInTheDocument();
  });

  it('no envía si falta el nombre aunque haya archivo', () => {
    setup();
    selectFile(createFile('apunte.txt'));

    fireEvent.click(screen.getByText('Generar desde archivo'));

    expect(screen.getByText('El nombre del tema es obligatorio')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('llama a onCancel al cancelar', () => {
    setup();

    fireEvent.click(screen.getByText('Cancelar'));

    expect(onCancel).toHaveBeenCalled();
  });
});
