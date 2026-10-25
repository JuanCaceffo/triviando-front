export interface ITopicDTO {
  emoji: string;
  size: number;
  topic: string;
}

export interface ITopic {
  name: string;
  icon: string;
  color: string;
  questionsCount: number;
}

export type GenerationJobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface IGenerationJobCreatedDTO {
  jobId: string;
  topic: string;
  status: GenerationJobStatus;
  progress: number;
}

export interface IGenerationJobDTO {
  jobId: string;
  topic: string;
  status: GenerationJobStatus;
  progress: number;
  result: ITopicDTO[] | null;
  error: string | null;
}
