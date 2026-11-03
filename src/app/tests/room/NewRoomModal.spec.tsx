import { fireEvent, render, screen } from '@testing-library/react';
import NewRoomModal from '@/app/(pages)/[username]/topics/components/NewRoomModal';

describe('NewRoomModal', () => {
  const onCreateTopic = jest.fn();
  const onCreateFromFile = jest.fn();
  const onJoin = jest.fn();
  const onClose = jest.fn();

  const setup = (props = {}) =>
    render(
      <NewRoomModal
        isOpen
        isPremium
        creating={false}
        onClose={onClose}
        onCreateTopic={onCreateTopic}
        onCreateFromFile={onCreateFromFile}
        onJoin={onJoin}
        {...props}
      />,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('crea una sala por tema', () => {
    setup();
    expect(screen.getByText('Jugar en grupo')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre del tema')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nombre del tema'), {
      target: { value: 'Historia' },
    });
    fireEvent.click(screen.getByRole('button', { name: /crear sala/i }));

    expect(onCreateTopic).toHaveBeenCalledWith('Historia');
  });

  it('valida el nombre del tema', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /crear sala/i }));
    expect(screen.getByText('El nombre del tema es obligatorio')).toBeInTheDocument();
    expect(onCreateTopic).not.toHaveBeenCalled();
  });

  it('permite unirse con un código válido', () => {
    setup();
    fireEvent.mouseDown(screen.getByRole('tab', { name: /unirme/i }));

    const input = screen.getByLabelText('Código de la sala');
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar a la sala/i }));
    expect(screen.getByText('Ingresá el código de 6 caracteres')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'abc123' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar a la sala/i }));
    expect(onJoin).toHaveBeenCalledWith('ABC123');
  });

  it('muestra el upsell a FREE pero permite unirse', () => {
    setup({ isPremium: false });
    expect(screen.getByText(/crear salas en vivo es premium/i)).toBeInTheDocument();
    expect(screen.queryByLabelText('Nombre del tema')).not.toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole('tab', { name: /unirme/i }));
    expect(screen.getByLabelText('Código de la sala')).toBeInTheDocument();
  });
});
