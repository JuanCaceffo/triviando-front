import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { passwordService } from '@/app/services/passwordService';
import { handleError } from '@/app/utils/errorHandler';
import ResetPasswordForm from '@/app/(pages)/reset-password/components/ResetPasswordForm';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/app/services/passwordService', () => ({
  passwordService: {
    resetPassword: jest.fn(),
  },
}));

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn() },
}));

jest.mock('@/app/utils/errorHandler', () => ({
  handleError: jest.fn(),
}));

describe('ResetPasswordForm', () => {
  const push = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
    jest.clearAllMocks();
  });

  const setToken = (token: string | null) => {
    const params = new URLSearchParams();
    if (token) {
      params.set('token', token);
    }
    (useSearchParams as jest.Mock).mockReturnValue(params);
  };

  it('shows an error state when the token is missing', () => {
    setToken(null);
    render(<ResetPasswordForm />);

    expect(screen.getByText(/el enlace de recuperación expiró/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pedir un código nuevo/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /volver al inicio de sesión/i })).toHaveAttribute(
      'href',
      '/login',
    );
    expect(screen.queryByLabelText(/contraseña nueva/i)).not.toBeInTheDocument();
  });

  it('navigates to forgot-password when requesting a new code', () => {
    setToken(null);
    render(<ResetPasswordForm />);

    fireEvent.click(screen.getByRole('button', { name: /pedir un código nuevo/i }));
    expect(push).toHaveBeenCalledWith('/forgot-password');
  });

  it('shows validation error for a short password', async () => {
    setToken('token-1');
    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByLabelText(/contraseña nueva/i), {
      target: { value: 'corta' },
    });
    fireEvent.change(screen.getByLabelText(/repetí la contraseña/i), {
      target: { value: 'corta' },
    });
    fireEvent.click(screen.getByRole('button', { name: /guardar contraseña/i }));

    await screen.findByText(/al menos 8 caracteres/i);
    expect(passwordService.resetPassword).not.toHaveBeenCalled();
  });

  it('shows error when passwords do not match', async () => {
    setToken('token-1');
    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByLabelText(/contraseña nueva/i), {
      target: { value: 'NuevaClave123' },
    });
    fireEvent.change(screen.getByLabelText(/repetí la contraseña/i), {
      target: { value: 'OtraClave123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /guardar contraseña/i }));

    await screen.findByText(/las contraseñas deben coincidir/i);
    expect(passwordService.resetPassword).not.toHaveBeenCalled();
  });

  it('resets the password and redirects to login on success', async () => {
    setToken('token-1');
    (passwordService.resetPassword as jest.Mock).mockResolvedValue(undefined);
    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByLabelText(/contraseña nueva/i), {
      target: { value: 'NuevaClave123' },
    });
    fireEvent.change(screen.getByLabelText(/repetí la contraseña/i), {
      target: { value: 'NuevaClave123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /guardar contraseña/i }));

    await waitFor(() =>
      expect(passwordService.resetPassword).toHaveBeenCalledWith('token-1', 'NuevaClave123'),
    );
    expect(toast.success).toHaveBeenCalledWith('Contraseña actualizada');
    expect(push).toHaveBeenCalledWith('/login');
  });

  it('calls handleError when the reset fails', async () => {
    setToken('token-1');
    const error = new Error('expired');
    (passwordService.resetPassword as jest.Mock).mockRejectedValue(error);
    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByLabelText(/contraseña nueva/i), {
      target: { value: 'NuevaClave123' },
    });
    fireEvent.change(screen.getByLabelText(/repetí la contraseña/i), {
      target: { value: 'NuevaClave123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /guardar contraseña/i }));

    await waitFor(() => expect(handleError).toHaveBeenCalledWith(error));
    expect(push).not.toHaveBeenCalled();
  });
});
