/* eslint-disable @typescript-eslint/no-explicit-any */
import { roomService } from '../../services/roomService';
import { makeAnswer, makeRoom } from './fixtures';

jest.mock('../../services/baseService', () => {
  class MockBaseService {
    axiosService = {
      get: jest.fn(),
      post: jest.fn(),
      delete: jest.fn(),
    };
  }
  return {
    BaseService: MockBaseService,
    getApiBaseUrl: () => 'http://api.test/api/v1',
  };
});

describe('RoomService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('crea una sala por tema', async () => {
    const created = { code: 'ABC123', status: 'PREPARING' };
    (roomService as any).axiosService.post.mockResolvedValue({ data: created });

    await expect(roomService.createRoom('Historia')).resolves.toEqual(created);
    expect((roomService as any).axiosService.post).toHaveBeenCalledWith('/rooms', {
      topic: 'Historia',
    });
  });

  it('crea una sala desde archivo con multipart', async () => {
    const created = { code: 'ABC123', status: 'PREPARING' };
    (roomService as any).axiosService.post.mockResolvedValue({ data: created });
    const file = new File(['contenido'], 'apunte.txt', { type: 'text/plain' });

    await expect(roomService.createRoomFromFile('Biología', file)).resolves.toEqual(created);

    const [url, formData] = (roomService as any).axiosService.post.mock.calls[0];
    expect(url).toBe('/rooms/document');
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get('topic')).toBe('Biología');
    expect(formData.get('file')).toBe(file);
  });

  it('devuelve null cuando no hay sala activa', async () => {
    (roomService as any).axiosService.get.mockResolvedValue({ status: 204, data: '' });
    await expect(roomService.getActiveRoom()).resolves.toBeNull();
  });

  it('devuelve la sala activa cuando existe', async () => {
    const room = makeRoom();
    (roomService as any).axiosService.get.mockResolvedValue({ status: 200, data: room });
    await expect(roomService.getActiveRoom()).resolves.toEqual(room);
  });

  it('une, consulta, inicia, responde, reacciona y sale', async () => {
    const room = makeRoom();
    const axios = (roomService as any).axiosService;
    axios.post.mockResolvedValue({ data: room });
    axios.get.mockResolvedValue({ data: room });
    axios.delete.mockResolvedValue({ data: undefined });

    await expect(roomService.joinRoom('ABC123')).resolves.toEqual(room);
    expect(axios.post).toHaveBeenLastCalledWith('/rooms/ABC123/join');

    axios.post.mockResolvedValue({ data: room });
    await expect(roomService.getRoom('ABC123')).resolves.toEqual(room);
    expect(axios.get).toHaveBeenLastCalledWith('/rooms/ABC123');

    axios.post.mockResolvedValue({ data: room });
    await expect(roomService.startRoom('ABC123')).resolves.toEqual(room);
    expect(axios.post).toHaveBeenLastCalledWith('/rooms/ABC123/start');

    const ack = makeAnswer('A');
    axios.post.mockResolvedValue({ data: ack });
    await expect(roomService.answer('ABC123', 10, 'A')).resolves.toEqual(ack);
    expect(axios.post).toHaveBeenLastCalledWith('/rooms/ABC123/answers', {
      questionId: 10,
      option: 'A',
    });

    axios.post.mockResolvedValue({ data: undefined });
    await roomService.react('ABC123', '🔥');
    expect(axios.post).toHaveBeenLastCalledWith('/rooms/ABC123/reactions', {
      emoji: '🔥',
    });

    await roomService.leaveRoom('ABC123');
    expect(axios.post).toHaveBeenLastCalledWith('/rooms/ABC123/leave');

    await roomService.closeRoom('ABC123');
    expect(axios.delete).toHaveBeenLastCalledWith('/rooms/ABC123');
  });

  it('arma la URL de eventos SSE', () => {
    expect(roomService.getEventsUrl('ABC123')).toBe(
      'http://api.test/api/v1/rooms/ABC123/events',
    );
  });

  it('propaga errores del backend', async () => {
    (roomService as any).axiosService.post.mockRejectedValue(new Error('boom'));
    await expect(roomService.createRoom('x')).rejects.toThrow('boom');
  });
});
