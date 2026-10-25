import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import CreateTopicModal from '@/app/(pages)/[username]/topics/components/NewTopicModal';

describe('CreateTopicModal', () => {
  const onClose = jest.fn();
  const onGenerateTopic = jest.fn();
  const onGenerateFromFile = jest.fn();

  const setup = (props = {}) =>
    render(
      <CreateTopicModal
        isOpen={true}
        onClose={onClose}
        onGenerateTopic={onGenerateTopic}
        onGenerateFromFile={onGenerateFromFile}
        {...props}
      />,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal with all fields', () => {
    setup();
    expect(screen.getByText('Crear Nuevo Tema')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre del tema')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByText('Crear Tema')).toBeInTheDocument();
  });

  it('shows validation errors if fields are empty', () => {
    setup();
    fireEvent.click(screen.getByText('Crear Tema'));
    expect(screen.getByText('El nombre del tema es obligatorio')).toBeInTheDocument();
    expect(onGenerateTopic).not.toHaveBeenCalled();
  });

  it('clears errors when typing in fields', () => {
    setup();
    fireEvent.click(screen.getByText('Crear Tema'));
    const nameInput = screen.getByLabelText('Nombre del tema');
    fireEvent.change(nameInput, { target: { value: 'Matemáticas' } });
    expect(screen.queryByText('El nombre del tema es obligatorio')).not.toBeInTheDocument();
  });

  it('calls onGenerateTopic and onClose with valid input', () => {
    setup();
    fireEvent.change(screen.getByLabelText('Nombre del tema'), { target: { value: 'Historia' } });

    fireEvent.click(screen.getByText('Crear Tema'));
    expect(onGenerateTopic).toHaveBeenCalledWith({ name: 'Historia' });
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Cancelar is clicked', () => {
    setup();
    fireEvent.click(screen.getByText('Cancelar'));
    expect(onClose).toHaveBeenCalled();
  });

  it('permite crear un tema a partir de un archivo', () => {
    setup();

    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Desde archivo' }));

    const file = new File(['contenido del archivo'], 'apunte.txt', { type: 'text/plain' });
    fireEvent.change(screen.getByLabelText('Nombre del tema'), {
      target: { value: 'Biología' },
    });
    fireEvent.change(screen.getByLabelText('Archivo'), { target: { files: [file] } });
    fireEvent.click(screen.getByText('Generar desde archivo'));

    expect(onGenerateFromFile).toHaveBeenCalledWith('Biología', file);
    expect(onClose).toHaveBeenCalled();
  });
});
