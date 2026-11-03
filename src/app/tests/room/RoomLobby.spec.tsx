import { fireEvent, render, screen } from '@testing-library/react';
import RoomLobby from '@/app/(pages)/room/[code]/components/RoomLobby';
import { makePlayer, makeRoom } from './fixtures';

describe('RoomLobby', () => {
  it('permite al anfitrión iniciar con dos jugadores', () => {
    const onStart = jest.fn();
    render(
      <RoomLobby
        room={makeRoom({ me: { ...makeRoom().me, host: true } })}
        isHost
        starting={false}
        onStart={onStart}
      />,
    );

    const button = screen.getByRole('button', { name: /iniciar partida/i });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('deshabilita el inicio si falta un jugador', () => {
    render(
      <RoomLobby
        room={makeRoom({
          players: [makePlayer({ userId: 1, host: true })],
          me: { ...makeRoom().me, host: true },
        })}
        isHost
        starting={false}
        onStart={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /iniciar partida/i })).toBeDisabled();
    expect(screen.getByText(/faltan 1 jugador/i)).toBeInTheDocument();
  });

  it('muestra la espera a los invitados', () => {
    render(
      <RoomLobby room={makeRoom()} isHost={false} starting={false} onStart={jest.fn()} />,
    );

    expect(screen.queryByRole('button', { name: /iniciar partida/i })).not.toBeInTheDocument();
    expect(screen.getByText(/esperando que el anfitrión/i)).toBeInTheDocument();
  });
});
