import { googleAuthService } from '../../services/googleAuthService';

const mockAxiosPost = jest.fn();
jest.spyOn(googleAuthService['axiosService'], 'post').mockImplementation(mockAxiosPost);

describe('GoogleAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends the Google credential and returns the JWT', async () => {
    mockAxiosPost.mockResolvedValueOnce({ data: 'application-jwt' });

    const token = await googleAuthService.authenticate('google-id-token');

    expect(mockAxiosPost).toHaveBeenCalledWith('/auth/google', {
      credential: 'google-id-token',
    });
    expect(token).toBe('application-jwt');
  });

  it('supports a token response object', async () => {
    mockAxiosPost.mockResolvedValueOnce({ data: { token: 'application-jwt' } });

    await expect(googleAuthService.authenticate('google-id-token')).resolves.toBe(
      'application-jwt',
    );
  });

  it('rejects an empty JWT response', async () => {
    mockAxiosPost.mockResolvedValueOnce({ data: '' });

    await expect(googleAuthService.authenticate('google-id-token')).rejects.toThrow(
      'No se recibió el JWT del servidor',
    );
  });
});
