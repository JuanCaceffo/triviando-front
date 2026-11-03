import { fireEvent, render, screen } from '@testing-library/react';
import RoomHeader from '@/app/(pages)/room/[code]/components/RoomHeader';
import { makeRoom } from './fixtures';

describe('RoomHeader', () => {
  it('copia código y link, y permite salir', () => {
    const onCopyCode = jest.fn();
    const onCopyLink = jest.fn();
    const onLeave = jest.fn();

    render(
      <RoomHeader
        room={makeRoom()}
        connectionState="open"
        onCopyCode={onCopyCode}
        onCopyLink={onCopyLink}
        onLeave={onLeave}
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByText('En vivo')).toBeInTheDocument();
    expect(screen.getByText(/ABC123/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /código/i }));
    fireEvent.click(screen.getByRole('button', { name: /link/i }));
    fireEvent.click(screen.getByRole('button', { name: /salir/i }));
    expect(onCopyCode).toHaveBeenCalledTimes(1);
    expect(onCopyLink).toHaveBeenCalledTimes(1);
    expect(onLeave).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: /cerrar/i })).not.toBeInTheDocument();
  });

  it('muestra cerrar solo al anfitrión', () => {
    const onClose = jest.fn();
    render(
      <RoomHeader
        room={makeRoom({ me: { ...makeRoom().me, host: true } })}
        connectionState="reconnecting"
        onCopyCode={jest.fn()}
        onCopyLink={jest.fn()}
        onLeave={jest.fn()}
        onClose={onClose}
      />,
    );

    expect(screen.getByText('Reconectando…')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /cerrar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
