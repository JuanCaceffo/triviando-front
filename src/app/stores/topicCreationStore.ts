import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CreatingTopic {
  name: string;
  timestamp: number;
  jobId?: string;
  progress?: number;
}

interface TopicCreationStore {
  creatingTopics: CreatingTopic[];
  setCreating: (name: string) => void;
  removeCreating: (name: string) => void;
  isCreating: (name: string) => boolean;
  clearOldCreations: () => void;
  setJob: (name: string, jobId: string) => void;
  updateProgress: (name: string, progress: number) => void;
  refreshCallback: (() => Promise<void>) | null;
  setRefreshCallback: (callback: () => Promise<void>) => void;
}

export const useTopicCreationStore = create<TopicCreationStore>()(
  persist(
    (set, get) => ({
      creatingTopics: [],
      refreshCallback: null,

      setCreating: (name: string) => {
        set((state) => {
          const previous = state.creatingTopics.find((topic) => topic.name === name);
          return {
            creatingTopics: [
              ...state.creatingTopics.filter((t) => t.name !== name),
              {
                name,
                timestamp: Date.now(),
                jobId: previous?.jobId,
                progress: previous?.progress,
              },
            ],
          };
        });
      },

      setJob: (name: string, jobId: string) => {
        set((state) => ({
          creatingTopics: state.creatingTopics.map((topic) =>
            topic.name === name ? { ...topic, jobId, progress: 0 } : topic,
          ),
        }));
      },

      updateProgress: (name: string, progress: number) => {
        set((state) => ({
          creatingTopics: state.creatingTopics.map((topic) =>
            topic.name === name ? { ...topic, progress } : topic,
          ),
        }));
      },

      removeCreating: (name: string) => {
        set((state) => ({
          creatingTopics: state.creatingTopics.filter((t) => t.name !== name),
        }));
        // Trigger refresh when a topic creation is completed
        // Solo si no estamos en medio de una operación de creación
        const { refreshCallback } = get();
        if (refreshCallback) {
          // Ejecutar el refresh de forma silenciosa para evitar errores duplicados
          refreshCallback().catch((error) => {
            console.warn('Error en refresh automático del store:', error);
          });
        }
      },

      isCreating: (name: string) => {
        return get().creatingTopics.some((t) => t.name === name);
      },

      clearOldCreations: () => {
        const oneHourAgo = Date.now() - 60 * 60 * 1000; // 1 hora
        set((state) => ({
          creatingTopics: state.creatingTopics.filter((t) => t.timestamp > oneHourAgo),
        }));
      },

      setRefreshCallback: (callback: () => Promise<void>) => {
        set({ refreshCallback: callback });
      },
    }),
    {
      name: 'topic-creation-storage',
    },
  ),
);
