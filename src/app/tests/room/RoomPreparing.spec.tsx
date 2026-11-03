import { fireEvent, render, screen } from '@testing-library/react';
import RoomPreparing from '@/app/(pages)/room/[code]/components/RoomPreparing';
import { makeRoom } from './fixtures';

describe('RoomPreparing', () => {
  it('muestra el progreso y permite cancelar al anfitrión', () => {
    const onCancel = jest.fn();
    render(
      <RoomPreparing
        room={makeRoom({
          status: 'PREPARING',
          generation: { status: 'PROCESSING', progress: 45 },
          me: { ...makeRoom().me, host: true },
        })}
        isHost
        onCancel={onCancel}
      />,
    );

    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText(/host user/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /cancelar sala/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('muestra el error de generación y no el progreso', () => {
    render(
      <RoomPreparing
        room={makeRoom({
          status: 'PREPARING',
          generation: {
            status: 'FAILED',
            progress: 0,
            error: 'No se pudieron generar las preguntas',
          },
        })}
        isHost={false}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByText('No se pudieron generar las preguntas')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cancelar sala/i })).not.toBeInTheDocument();
  });
});
