import { BaseService } from './baseService';
import {
  IGenerationJobCreatedDTO,
  IGenerationJobDTO,
  ITopicDTO,
} from '../(pages)/[username]/topics/types';

class TopicService extends BaseService {
  getTopics = async ({ id }: { id: number }): Promise<ITopicDTO[]> => {
    const { data } = await this.axiosService.get(`/preguntas/topicos/${id}`);
    return data;
  };

  generateTopic = async (name: string): Promise<ITopicDTO[]> => {
    const { data } = await this.axiosService.post('/preguntas/generate', {
      topic: name,
      promptType: 'topicPrompter',
    });

    return data;
  };

  generateTopicFromFile = async (name: string, file: File): Promise<IGenerationJobCreatedDTO> => {
    const formData = new FormData();
    formData.append('topic', name);
    formData.append('file', file);

    // No seteamos Content-Type: axios agrega el boundary de multipart.
    const { data } = await this.axiosService.post('/preguntas/document/generate', formData);
    return data;
  };

  getGenerationJob = async (jobId: string): Promise<IGenerationJobDTO> => {
    const { data } = await this.axiosService.get(`/preguntas/document/jobs/${jobId}`);
    return data;
  };
}

export const topicService = new TopicService();
