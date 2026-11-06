import { render, screen } from '@testing-library/react';
import QuizQuestionHeader from '@/app/components/quiz/QuizQuestionHeader';

describe('QuizQuestionHeader', () => {
  it('muestra el avance de las preguntas en texto', () => {
    render(<QuizQuestionHeader current={3} total={10} />);

    expect(screen.getByText('Pregunta 3 de 10')).toBeInTheDocument();
  });

  it('no muestra el tiempo si no se recibe', () => {
    render(<QuizQuestionHeader current={1} total={5} />);

    expect(screen.queryByText(/^\d+s$/)).not.toBeInTheDocument();
  });

  it('muestra los segundos restantes junto al reloj', () => {
    const { container } = render(
      <QuizQuestionHeader current={1} total={5} secondsLeft={28} />,
    );

    expect(screen.getByText('28s')).toBeInTheDocument();
    expect(container.querySelector('.lucide-clock')).toBeInTheDocument();
  });

  it('muestra cero segundos cuando el tiempo se agotó', () => {
    render(<QuizQuestionHeader current={1} total={5} secondsLeft={0} />);

    expect(screen.getByText('0s')).toBeInTheDocument();
  });
});
