import {
  findTopic,
  hasTopic,
  toTopic,
} from '@/app/(pages)/[username]/topics/utils/topicMapper';
import { ITopic, ITopicDTO } from '@/app/(pages)/[username]/topics/types';

const dto = (topic: string): ITopicDTO => ({ topic, emoji: '🧬', size: 10 });
const topic = (name: string): ITopic => ({
  name,
  icon: '🧬',
  color: '#06b6d4',
  questionsCount: 10,
});

describe('topicMapper', () => {
  describe('toTopic', () => {
    it('mapea el DTO de la API al modelo de la UI', () => {
      expect(toTopic(dto('Biología'))).toEqual({
        name: 'Biología',
        icon: '🧬',
        color: '#06b6d4',
        questionsCount: 10,
      });
    });
  });

  describe('findTopic', () => {
    it('encuentra el tópico ignorando mayúsculas y espacios', () => {
      expect(findTopic([dto('Otra'), dto('Biología')], '  biología ')).toEqual(dto('Biología'));
    });

    it('cae al primer resultado si el nombre no coincide', () => {
      expect(findTopic([dto('Otra'), dto('Biología')], 'Química')).toEqual(dto('Otra'));
    });

    it('devuelve undefined si no hay resultados', () => {
      expect(findTopic(undefined, 'Biología')).toBeUndefined();
      expect(findTopic([], 'Biología')).toBeUndefined();
      expect(findTopic(null, 'Biología')).toBeUndefined();
    });
  });

  describe('hasTopic', () => {
    it('detecta el tópico ignorando mayúsculas y espacios', () => {
      expect(hasTopic([topic('Biología')], ' biología ')).toBe(true);
    });

    it('devuelve false si no existe', () => {
      expect(hasTopic([topic('Biología')], 'Química')).toBe(false);
    });
  });
});
