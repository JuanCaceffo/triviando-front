import { fireEvent, render, screen } from '@testing-library/react';
import RoomReactions from '@/app/(pages)/room/[code]/components/RoomReactions';

describe('RoomReactions', () => {
  const reaction = {
    id: '1',
    userId: 2,
    username: 'guest',
    emoji: '🔥',
    sentAtEpochMs: 1,
  };

  it('muestra reacciones y envía la elegida', () => {
    const onReact = jest.fn();
    render(<RoomReactions reactions={[reaction]} onReact={onReact} />);

    expect(screen.getByTitle('@guest')).toHaveTextContent('🔥');
    fireEvent.click(screen.getByRole('button', { name: /reaccionar con 👍/i }));
    expect(onReact).toHaveBeenCalledWith('👍');
  });

  it('deshabilita las reacciones cuando corresponde', () => {
    render(<RoomReactions reactions={[]} onReact={jest.fn()} disabled />);
    expect(screen.getByRole('button', { name: /reaccionar con 🔥/i })).toBeDisabled();
  });
});
