import { ITopic, ITopicDTO } from '../types';

const normalizeName = (value: string) => value.trim().toLowerCase();

export const toTopic = (dto: ITopicDTO): ITopic => ({
  name: dto.topic,
  icon: dto.emoji,
  color: '#06b6d4',
  questionsCount: dto.size,
});

/**
 * Busca el tópico por nombre (trim + case-insensitive). Si el backend devuelve
 * un nombre con otra normalización, cae al primer resultado de la respuesta.
 */
export const findTopic = (
  topics: ITopicDTO[] | null | undefined,
  name: string,
): ITopicDTO | undefined =>
  topics?.find((topic) => normalizeName(topic.topic) === normalizeName(name)) ?? topics?.[0];

export const hasTopic = (topics: ITopic[], name: string): boolean =>
  topics.some((topic) => normalizeName(topic.name) === normalizeName(name));
