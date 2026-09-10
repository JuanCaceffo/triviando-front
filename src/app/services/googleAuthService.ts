import { BaseService } from './baseService';

type GoogleAuthResponse = string | { token: string };

class GoogleAuthService extends BaseService {
  async authenticate(credential: string): Promise<string> {
    const { data } = await this.axiosService.post<GoogleAuthResponse>('/auth/google', {
      credential,
    });

    const token = typeof data === 'string' ? data : data.token;

    if (!token) {
      throw new Error('No se recibió el JWT del servidor');
    }

    return token;
  }
}

export const googleAuthService = new GoogleAuthService();
