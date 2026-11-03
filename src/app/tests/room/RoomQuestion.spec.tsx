import { fireEvent, render, screen } from '@testing-library/react';
import RoomQuestion from '@/app/(pages)/room/[code]/components/RoomQuestion';
import { makePlayer, makeQuestion, makeRoom } from './fixtures';

const baseProps = {
  remainingSeconds: 20,
  timerProgress: 66,
  isExpired: false,
  submitting: false,
  onAnswer: jest.fn(),
  onReact: jest.fn(),
  reactions: [],
};

describe('RoomQuestion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('permite responder y muestra el contador de respuestas', () => {
    render(
      <RoomQuestion
        {...baseProps}
        room={makeRoom({
          status: 'IN_PROGRESS',
          currentQuestion: makeQuestion(),
          questionDeadlineEpochMs: Date.now() + 20_000,
        })}
      />,
    );

    expect(screen.getByText(/pregunta 1 de 10/i)).toBeInTheDocument();
    expect(screen.getByText(/0 de 2 respondieron/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: /parís/i }));
    expect(baseProps.onAnswer).toHaveBeenCalledWith('A');
  });

  it('deshabilita las opciones cuando ya respondió', () => {
    render(
      <RoomQuestion
        {...baseProps}
        room={makeRoom({
          status: 'IN_PROGRESS',
          currentQuestion: makeQuestion(),
          me: {
            userId: 2,
            host: false,
            answeredCurrent: true,
            selectedOption: 'A',
            rank: 2,
          },
        })}
      />,
    );

    expect(screen.getByRole('radio', { name: /parís/i })).toBeDisabled();
    expect(screen.getByText(/respuesta enviada/i)).toBeInTheDocument();
  });

  it('en el reveal marca la correcta, muestra la explicación y la tabla', () => {
    const players = [
      makePlayer({ userId: 1, score: 150, rank: 1, pointsLastRound: 150, correctLastRound: true }),
      makePlayer({
        userId: 2,
        score: 0,
        rank: 2,
        pointsLastRound: 0,
        correctLastRound: false,
      }),
    ];

    render(
      <RoomQuestion
        {...baseProps}
        room={makeRoom({
          status: 'IN_PROGRESS',
          revealUntilEpochMs: Date.now() + 8000,
          players,
          currentQuestion: makeQuestion({
            correctOptionLetter: 'A',
            correctOptionText: 'París',
            explanation: 'París es la capital de Francia.',
          }),
          me: {
            userId: 2,
            host: false,
            answeredCurrent: true,
            selectedOption: 'B',
            pointsLastRound: 0,
            correctLastRound: false,
            rank: 2,
          },
        })}
      />,
    );

    expect(screen.getByText('¿Por qué?')).toBeInTheDocument();
    expect(screen.getByText('París es la capital de Francia.')).toBeInTheDocument();
    expect(screen.getByText(/esta vez no fue correcta/i)).toBeInTheDocument();
    expect(screen.getByRole('list', { name: /puntajes de la ronda/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /londres/i })).toBeDisabled();
  });

  it('muestra el tiempo agotado', () => {
    render(
      <RoomQuestion
        {...baseProps}
        isExpired
        remainingSeconds={0}
        timerProgress={0}
        room={makeRoom({
          status: 'IN_PROGRESS',
          currentQuestion: makeQuestion(),
        })}
      />,
    );

    expect(screen.getByText(/tiempo agotado/i)).toBeInTheDocument();
  });
});
