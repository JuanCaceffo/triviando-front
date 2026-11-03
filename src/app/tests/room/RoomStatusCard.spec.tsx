import { fireEvent, render, screen } from '@testing-library/react';
import RoomStatusCard from '@/app/(pages)/room/[code]/components/RoomStatusCard';

describe('RoomStatusCard', () => {
  it('muestra el mensaje y ejecuta la acción', () => {
    const onAction = jest.fn();
    render(
      <RoomStatusCard
        title="La sala se cerró"
        description="El anfitrión cerró la sala."
        actionLabel="Volver a mis temas"
        onAction={onAction}
        tone="error"
      />,
    );

    expect(screen.getByText('La sala se cerró')).toBeInTheDocument();
    expect(screen.getByText('El anfitrión cerró la sala.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /volver a mis temas/i }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
