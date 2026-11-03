import { fireEvent, render, screen } from '@testing-library/react';
import RoomResults from '@/app/(pages)/room/[code]/components/RoomResults';
import { makePlayer, makeRoom } from './fixtures';

describe('RoomResults', () => {
  const players = [
    makePlayer({ userId: 1, name: 'Host User', username: 'host', score: 300, correctCount: 2, rank: 1 }),
    makePlayer({ userId: 2, score: 150, correctCount: 1, rank: 2 }),
  ];

  const room = makeRoom({
    status: 'FINISHED',
    players,
    teamSummary: {
      totalCorrect: 3,
      totalAnswers: 4,
      totalQuestions: 2,
      participants: 2,
      accuracy: 0.75,
      bestPlayer: players[0],
    },
  });

  it('muestra el resumen cooperativo y la tabla final', () => {
    render(<RoomResults room={room} onBack={jest.fn()} onLeave={jest.fn()} />);

    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText(/acertó 3 de 4/i)).toBeInTheDocument();
    expect(screen.getAllByText('Host User').length).toBeGreaterThan(0);
    expect(screen.getByRole('list', { name: /tabla final/i })).toBeInTheDocument();
  });

  it('dispara volver y salir', () => {
    const onBack = jest.fn();
    const onLeave = jest.fn();
    render(<RoomResults room={room} onBack={onBack} onLeave={onLeave} />);

    fireEvent.click(screen.getByRole('button', { name: /volver a mis temas/i }));
    fireEvent.click(screen.getByRole('button', { name: /salir de la sala/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onLeave).toHaveBeenCalledTimes(1);
  });
});
