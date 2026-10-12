import { BaseService } from './baseService';

interface ForgotPasswordResponse {
  message: string;
}

interface VerifyResetCodeResponse {
  resetToken: string;
}

/**
 * Flujo de recuperación de contraseña:
 * forgotPassword -> verifyResetCode -> resetPassword
 */
class PasswordService extends BaseService {
  async forgotPassword(identifier: string): Promise<ForgotPasswordResponse> {
    const { data } = await this.axiosService.post<ForgotPasswordResponse>('/auth/forgot-password', {
      identifier,
    });
    return data;
  }

  async verifyResetCode(identifier: string, code: string): Promise<VerifyResetCodeResponse> {
    const { data } = await this.axiosService.post<VerifyResetCodeResponse>(
      '/auth/verify-reset-code',
      { identifier, code },
    );
    return data;
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    await this.axiosService.post('/auth/reset-password', { resetToken, newPassword });
  }
}

export const passwordService = new PasswordService();
