import { fireEvent, render, screen } from '@testing-library/react';
import QuizOptionButton from '@/app/components/quiz/QuizOptionButton';

describe('QuizOptionButton', () => {
  it('muestra la letra y el texto de la opción', () => {
    render(<QuizOptionButton letter="A" text="California" />);

    const option = screen.getByRole('radio', { name: /california/i });
    expect(option).toHaveTextContent('A');
    expect(option).toHaveTextContent('California');
  });

  it('llama a onSelect al hacer click', () => {
    const onSelect = jest.fn();
    render(<QuizOptionButton letter="B" text="Texas" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('radio', { name: /texas/i }));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('no dispara onSelect cuando está deshabilitada', () => {
    const onSelect = jest.fn();
    render(<QuizOptionButton letter="C" text="Nuevo México" disabled onSelect={onSelect} />);

    const option = screen.getByRole('radio', { name: /nuevo méxico/i });
    expect(option).toBeDisabled();
    fireEvent.click(option);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('marca el estado seleccionado', () => {
    render(<QuizOptionButton letter="A" text="California" state="selected" />);

    const option = screen.getByRole('radio', { name: /california/i });
    expect(option).toHaveAttribute('aria-checked', 'true');
    expect(option).toHaveClass('border-cyan-500');
  });

  it('respeta el estado de selección explícito para aria-checked', () => {
    render(<QuizOptionButton letter="D" text="Arizona" state="correct" checked={false} />);

    expect(screen.getByRole('radio', { name: /arizona/i })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('distingue los estados correcto e incorrecto', () => {
    const { container, rerender } = render(
      <QuizOptionButton letter="A" text="California" state="correct" />,
    );
    expect(screen.getByRole('radio', { name: /california/i })).toHaveClass('border-green-500');
    expect(container.querySelector('.text-green-600')).toBeInTheDocument();

    rerender(<QuizOptionButton letter="A" text="California" state="incorrect" />);
    expect(screen.getByRole('radio', { name: /california/i })).toHaveClass('border-red-400');
    expect(container.querySelector('.text-red-500')).toBeInTheDocument();
  });

  it('muestra el loader mientras se envía la respuesta', () => {
    const { container } = render(<QuizOptionButton letter="A" text="California" pending />);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('atenúa la opción en estado muted', () => {
    render(<QuizOptionButton letter="B" text="Texas" state="muted" />);

    expect(screen.getByRole('radio', { name: /texas/i })).toHaveClass('opacity-60');
  });
});
