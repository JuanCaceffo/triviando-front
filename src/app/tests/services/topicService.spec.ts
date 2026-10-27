/* eslint-disable @typescript-eslint/no-explicit-any */
import { topicService } from '../../services/topicService';

jest.mock('../../services/baseService', () => {
  class MockBaseService {
    axiosService = {
      get: jest.fn(),
      post: jest.fn(),
    };
  }
  return { BaseService: MockBaseService };
});

describe('TopicService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTopics', () => {
    it('should call axiosService.get with correct URL and return data', async () => {
      const mockData = { topics: ['math', 'science'] };
      (topicService as any).axiosService.get = jest.fn().mockResolvedValue({ data: mockData });

      const result = await topicService.getTopics({ id: 42 });

      expect((topicService as any).axiosService.get).toHaveBeenCalledWith('/preguntas/topicos/42');
      expect(result).toEqual(mockData);
    });
  });

  describe('generateTopic', () => {
    it('should call axiosService.post with correct payload and return data', async () => {
      const mockData = { id: 1, topic: 'history' };
      (topicService as any).axiosService.post = jest.fn().mockResolvedValue({ data: mockData });

      const result = await topicService.generateTopic('history');

      expect((topicService as any).axiosService.post).toHaveBeenCalledWith('/preguntas/generate', {
        topic: 'history',
        promptType: 'topicPrompter'
      });
      expect(result).toEqual(mockData);
    });
  });

  describe('generateTopicFromFile', () => {
    it('debe enviar el topic y el archivo como FormData', async () => {
      const mockData = { jobId: 1, topic: 'biologia', status: 'PENDING', progress: 0 };
      (topicService as any).axiosService.post = jest.fn().mockResolvedValue({ data: mockData });
      const file = new File(['contenido'], 'apunte.txt', { type: 'text/plain' });

      const result = await topicService.generateTopicFromFile('biologia', file);

      expect((topicService as any).axiosService.post).toHaveBeenCalledTimes(1);
      const [url, formData] = (topicService as any).axiosService.post.mock.calls[0];
      expect(url).toBe('/preguntas/document/generate');
      expect(formData).toBeInstanceOf(FormData);
      expect(formData.get('topic')).toBe('biologia');
      expect(formData.get('file')).toBe(file);
      expect(result).toEqual(mockData);
    });
  });

  describe('getGenerationJob', () => {
    it('debe consultar el estado del job por id', async () => {
      const mockData = {
        jobId: 1,
        topic: 'biologia',
        status: 'COMPLETED',
        progress: 100,
        result: [],
        error: null,
      };
      (topicService as any).axiosService.get = jest.fn().mockResolvedValue({ data: mockData });

      const result = await topicService.getGenerationJob(1);

      expect((topicService as any).axiosService.get).toHaveBeenCalledWith(
        '/preguntas/document/jobs/1',
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('error handling', () => {
    it('should throw if getTopics fails', async () => {
      (topicService as any).axiosService.get = jest
        .fn()
        .mockRejectedValue(new Error('Network error'));
      await expect(topicService.getTopics({ id: 1 })).rejects.toThrow('Network error');
    });

    it('should throw if generateTopic fails', async () => {
      (topicService as any).axiosService.post = jest
        .fn()
        .mockRejectedValue(new Error('Post error'));
      await expect(topicService.generateTopic('fail')).rejects.toThrow('Post error');
    });
  });
});
