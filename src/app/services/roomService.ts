import { BaseService, getApiBaseUrl } from './baseService';
import {
  AnswerAck,
  RoomCreated,
  RoomLetter,
  RoomSnapshot,
} from '../(pages)/room/[code]/types';

class RoomService extends BaseService {
  createRoom = async (topic: string): Promise<RoomCreated> => {
    const { data } = await this.axiosService.post('/rooms', { topic });
    return data;
  };

  createRoomFromFile = async (topic: string, file: File): Promise<RoomCreated> => {
    const formData = new FormData();
    formData.append('topic', topic);
    formData.append('file', file);

    // No seteamos Content-Type: axios agrega el boundary de multipart.
    const { data } = await this.axiosService.post('/rooms/document', formData);
    return data;
  };

  getActiveRoom = async (): Promise<RoomSnapshot | null> => {
    const response = await this.axiosService.get('/rooms/active');
    if (response.status === 204 || !response.data) {
      return null;
    }
    return response.data;
  };

  joinRoom = async (code: string): Promise<RoomSnapshot> => {
    const { data } = await this.axiosService.post(`/rooms/${encodeURIComponent(code)}/join`);
    return data;
  };

  getRoom = async (code: string): Promise<RoomSnapshot> => {
    const { data } = await this.axiosService.get(`/rooms/${encodeURIComponent(code)}`);
    return data;
  };

  startRoom = async (code: string): Promise<RoomSnapshot> => {
    const { data } = await this.axiosService.post(`/rooms/${encodeURIComponent(code)}/start`);
    return data;
  };

  answer = async (
    code: string,
    questionId: number,
    option: RoomLetter,
  ): Promise<AnswerAck> => {
    const { data } = await this.axiosService.post(
      `/rooms/${encodeURIComponent(code)}/answers`,
      { questionId, option },
    );
    return data;
  };

  react = async (code: string, emoji: string): Promise<void> => {
    await this.axiosService.post(`/rooms/${encodeURIComponent(code)}/reactions`, { emoji });
  };

  leaveRoom = async (code: string): Promise<void> => {
    await this.axiosService.post(`/rooms/${encodeURIComponent(code)}/leave`);
  };

  closeRoom = async (code: string): Promise<void> => {
    await this.axiosService.delete(`/rooms/${encodeURIComponent(code)}`);
  };

  getEventsUrl = (code: string): string =>
    `${getApiBaseUrl()}/rooms/${encodeURIComponent(code)}/events`;
}

export const roomService = new RoomService();
