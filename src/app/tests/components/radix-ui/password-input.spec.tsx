import * as React from 'react';
import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PasswordInput } from '../../../components/ui/password-input';

describe('PasswordInput', () => {
  it('renders an input with type password by default', () => {
    render(<PasswordInput aria-label="password" />);
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
  });

  it('renders the eye toggle button with accessible label', () => {
    render(<PasswordInput aria-label="password" />);
    expect(screen.getByRole('button', { name: /mostrar contraseña/i })).toBeInTheDocument();
  });

  it('toggles to visible text when clicking the eye button', () => {
    render(<PasswordInput aria-label="password" />);
    const input = screen.getByLabelText(/password/i);

    fireEvent.click(screen.getByRole('button', { name: /mostrar contraseña/i }));

    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /ocultar contraseña/i })).toBeInTheDocument();
  });

  it('toggles back to hidden when clicking twice', () => {
    render(<PasswordInput aria-label="password" />);
    const input = screen.getByLabelText(/password/i);

    fireEvent.click(screen.getByRole('button', { name: /mostrar contraseña/i }));
    fireEvent.click(screen.getByRole('button', { name: /ocultar contraseña/i }));

    expect(input).toHaveAttribute('type', 'password');
  });

  it('toggle button is type="button" (does not submit forms)', () => {
    render(<PasswordInput aria-label="password" />);
    expect(screen.getByRole('button', { name: /mostrar contraseña/i })).toHaveAttribute(
      'type',
      'button',
    );
  });

  it('forwards props to the underlying input', () => {
    render(
      <PasswordInput
        id="my-password"
        name="password"
        placeholder="••••••"
        required
        autoComplete="new-password"
      />,
    );
    const input = screen.getByPlaceholderText('••••••');
    expect(input).toHaveAttribute('id', 'my-password');
    expect(input).toHaveAttribute('name', 'password');
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('autocomplete', 'new-password');
  });

  it('merges className and keeps the reserved right padding for the icon', () => {
    render(<PasswordInput aria-label="password" className="custom-class" />);
    const input = screen.getByLabelText(/password/i);
    expect(input.className).toContain('pr-10');
    expect(input.className).toContain('custom-class');
  });

  it('works as a controlled input with value and onChange', () => {
    const ControlledHarness = () => {
      const [value, setValue] = useState('');
      return (
        <PasswordInput
          aria-label="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      );
    };
    render(<ControlledHarness />);
    const input = screen.getByLabelText(/password/i);

    fireEvent.change(input, { target: { value: 'secreta123' } });
    expect((input as HTMLInputElement).value).toBe('secreta123');

    // Value is preserved when toggling visibility
    fireEvent.click(screen.getByRole('button', { name: /mostrar contraseña/i }));
    expect((input as HTMLInputElement).value).toBe('secreta123');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('forwards ref to the underlying input', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<PasswordInput aria-label="password" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toHaveAttribute('type', 'password');
  });
});
