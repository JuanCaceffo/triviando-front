import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { passwordService } from '@/app/services/passwordService';
import { handleError } from '@/app/utils/errorHandler';
import ForgotPasswordForm from '@/app/(pages)/forgot-password/components/ForgotPasswordForm';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/app/services/passwordService', () => ({
  passwordService: {
    forgotPassword: jest.fn(),
    verifyResetCode: jest.fn(),
  },
}));

jest.mock('@/app/utils/errorHandler', () => ({
  handleError: jest.fn(),
}));

describe('ForgotPasswordForm', () => {
  const push = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const submitIdentifier = async (value: string) => {
    fireEvent.change(screen.getByLabelText(/email o usuario/i), {
      target: { value },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar código/i }));
    await waitFor(() => expect(passwordService.forgotPassword).toHaveBeenCalled());
  };

  it('shows validation error for empty identifier', async () => {
    render(<ForgotPasswordForm />);
    fireEvent.click(screen.getByRole('button', { name: /enviar código/i }));

    await screen.findByText(/ingresá tu email o usuario/i);
    expect(passwordService.forgotPassword).not.toHaveBeenCalled();
  });

  it('moves to the code step after requesting the code', async () => {
    (passwordService.forgotPassword as jest.Mock).mockResolvedValue({ message: 'ok' });
    render(<ForgotPasswordForm />);

    await submitIdentifier('juan@triviando.com.ar');

    expect(passwordService.forgotPassword).toHaveBeenCalledWith('juan@triviando.com.ar');
    expect(screen.getByText(/ingresá el código/i)).toBeInTheDocument();
    expect(screen.getByText(/juan@triviando\.com\.ar/i)).toBeInTheDocument();
    expect(screen.getByTestId('code-input')).toBeInTheDocument();
    // El backend responde genérico: el aviso no revela si la cuenta existía
    expect(screen.getByText(/si existe una cuenta con esos datos/i)).toBeInTheDocument();
  });

  it('calls handleError when the request fails', async () => {
    const error = new Error('fail');
    (passwordService.forgotPassword as jest.Mock).mockRejectedValue(error);
    render(<ForgotPasswordForm />);

    fireEvent.change(screen.getByLabelText(/email o usuario/i), {
      target: { value: 'juan@triviando.com.ar' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar código/i }));

    await waitFor(() => expect(handleError).toHaveBeenCalledWith(error));
    expect(screen.queryByTestId('code-input')).not.toBeInTheDocument();
  });

  it('keeps continue disabled until 6 digits are entered', async () => {
    (passwordService.forgotPassword as jest.Mock).mockResolvedValue({ message: 'ok' });
    render(<ForgotPasswordForm />);
    await submitIdentifier('juan@triviando.com.ar');

    const continueButton = screen.getByRole('button', { name: /continuar/i });
    expect(continueButton).toBeDisabled();

    const digits = screen.getAllByLabelText(/dígito \d de 6/i);
    fireEvent.change(digits[0], { target: { value: '1' } });
    expect(continueButton).toBeDisabled();

    digits.slice(1).forEach((input, index) => {
      fireEvent.change(input, { target: { value: String(index + 2) } });
    });

    expect(continueButton).toBeEnabled();
  });

  it('verifies the code and navigates to reset-password with the token', async () => {
    (passwordService.forgotPassword as jest.Mock).mockResolvedValue({ message: 'ok' });
    (passwordService.verifyResetCode as jest.Mock).mockResolvedValue({
      resetToken: 'session-token-1',
    });
    render(<ForgotPasswordForm />);
    await submitIdentifier('juan@triviando.com.ar');

    const digits = screen.getAllByLabelText(/dígito \d de 6/i);
    '123456'.split('').forEach((digit, index) => {
      fireEvent.change(digits[index], { target: { value: digit } });
    });
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

    await waitFor(() =>
      expect(passwordService.verifyResetCode).toHaveBeenCalledWith('juan@triviando.com.ar', '123456'),
    );
    expect(push).toHaveBeenCalledWith('/reset-password?token=session-token-1');
  });

  it('shows error and clears the code when verification fails', async () => {
    const error = new Error('bad code');
    (passwordService.forgotPassword as jest.Mock).mockResolvedValue({ message: 'ok' });
    (passwordService.verifyResetCode as jest.Mock).mockRejectedValue(error);
    render(<ForgotPasswordForm />);
    await submitIdentifier('juan@triviando.com.ar');

    const digits = screen.getAllByLabelText(/dígito \d de 6/i);
    '123456'.split('').forEach((digit, index) => {
      fireEvent.change(digits[index], { target: { value: digit } });
    });
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

    await waitFor(() => expect(handleError).toHaveBeenCalledWith(error));
    expect((digits[0] as HTMLInputElement).value).toBe('');
    expect(push).not.toHaveBeenCalled();
  });

  it('resend is disabled with a countdown and enables after 60 seconds', async () => {
    (passwordService.forgotPassword as jest.Mock).mockResolvedValue({ message: 'ok' });
    render(<ForgotPasswordForm />);
    await submitIdentifier('juan@triviando.com.ar');

    const resendButton = screen.getByRole('button', { name: /reenviar en 60 s/i });
    expect(resendButton).toBeDisabled();

    act(() => {
      jest.advanceTimersByTime(60000);
    });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /^reenviar código$/i })).toBeEnabled(),
    );

    fireEvent.click(screen.getByRole('button', { name: /^reenviar código$/i }));
    await waitFor(() => expect(passwordService.forgotPassword).toHaveBeenCalledTimes(2));
  });

  it('can go back to use another identifier', async () => {
    (passwordService.forgotPassword as jest.Mock).mockResolvedValue({ message: 'ok' });
    render(<ForgotPasswordForm />);
    await submitIdentifier('juan@triviando.com.ar');

    fireEvent.click(screen.getByRole('button', { name: /usar otro email o usuario/i }));

    expect(screen.getByLabelText(/email o usuario/i)).toBeInTheDocument();
    expect(screen.queryByTestId('code-input')).not.toBeInTheDocument();
  });
});
