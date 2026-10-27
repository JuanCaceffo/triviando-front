'use client';

import { useEffect, useRef, useState } from 'react';
import { parserTopics } from './utils/helpers';
import Header from './components/Header';
import Filter from './components/Filter';
import Topics from './components/Topics';
import { topicService } from '@/app/services/topicService';
import { ITopic, ITopicDTO } from './types';
import TopicsSkeleton from './components/TopicsSkeleton';
import { StreakModal } from '@/app/components/modals/StreakModal';
import { useCurrentUserId, useCurrentUser } from '@/app/utils/auth';
import { AccountOptions } from '@/app/domain/User';
import { toast } from 'react-toastify';
import { useTopicCreationStore } from '@/app/stores/topicCreationStore';
import type { CreatingTopic } from '@/app/stores/topicCreationStore';
import { waitForGenerationJob } from './utils/pollGenerationJob';
import { findTopic, hasTopic, toTopic } from './utils/topicMapper';
import { notifyApiError } from './utils/apiError';

export default function TopicsPage() {
  const userId = useCurrentUserId();
  const user = useCurrentUser();
  const isPremium = user?.account === AccountOptions.PREMIUM;
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [topics, setTopics] = useState<ITopic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const {
    creatingTopics,
    setCreating,
    removeCreating,
    clearOldCreations,
    setRefreshCallback,
    setJob,
    updateProgress,
  } = useTopicCreationStore();
  const resumedJobs = useRef(false);

  const refreshTopics = async (): Promise<void> => {
    try {
      if (!userId) return;
      const fetchedTopics = await topicService.getTopics({ id: userId });
      setTopics(parserTopics(fetchedTopics));
    } catch (error) {
      notifyApiError(error, 'No se pudieron cargar los tópicos.');
    }
  };

  const removeConfirmedTopics = (currentTopics: ITopic[]) => {
    creatingTopics.forEach((creatingTopic) => {
      if (hasTopic(currentTopics, creatingTopic.name)) {
        removeCreating(creatingTopic.name);
      }
    });
  };

  useEffect(() => {
    const getTopics = async () => {
      try {
        // Limpiar creaciones antiguas
        clearOldCreations();

        if (!userId) return;
        const fetchedTopics = parserTopics(await topicService.getTopics({ id: userId }));
        setTopics(fetchedTopics);
        removeConfirmedTopics(fetchedTopics);
      } catch (error) {
        notifyApiError(error, 'No se pudieron cargar los tópicos.');
      } finally {
        setLoading(false);
      }
    };

    // Registrar la función de refresco en el store
    setRefreshCallback(refreshTopics);

    getTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    const checkForCompletedTopics = async () => {
      if (creatingTopics.length === 0 || loading) return;

      // Refrescar la lista para ver si algún tópico se completó
      try {
        await refreshTopics();
        removeConfirmedTopics(topics);
      } catch (error) {
        // Error en la verificación automática no debe ser mostrado al usuario
        console.warn('Error al verificar tópicos completados:', error);
      }
    };

    if (!loading && creatingTopics.length > 0) {
      checkForCompletedTopics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatingTopics.length, loading]);

  const addTopicIfMissing = (dto: ITopicDTO) => {
    const newTopic = toTopic(dto);
    setTopics((previous) =>
      hasTopic(previous, newTopic.name) ? previous : [...previous, newTopic],
    );
    toast.success(`Tópico "${newTopic.name}" creado exitosamente.`);
  };

  const applyGeneratedTopic = (name: string, result: ITopicDTO[] | null) => {
    const created = findTopic(result, name);

    if (created) {
      addTopicIfMissing(created);
    } else {
      toast.error('No se pudo obtener el tópico generado. Intenta nuevamente.');
    }

    removeCreating(name);
  };

  const watchGenerationJob = async (name: string, jobId: number) => {
    try {
      const job = await waitForGenerationJob(jobId, {
        fetchJob: topicService.getGenerationJob,
        onProgress: (progress) => updateProgress(name, progress),
      });
      applyGeneratedTopic(name, job.result);
    } catch (error) {
      notifyApiError(error, 'No se pudieron generar las preguntas a partir del archivo.');
      removeCreating(name);
    }
  };

  // Reanudar el seguimiento de generaciones que quedaron en curso tras un refresh
  useEffect(() => {
    if (!userId || resumedJobs.current) return;
    resumedJobs.current = true;

    const pending = useTopicCreationStore
      .getState()
      .creatingTopics.filter(
        (entry): entry is CreatingTopic & { jobId: number } =>
          typeof entry.jobId === 'number' && Number.isFinite(entry.jobId),
      );

    pending.forEach((entry) => {
      watchGenerationJob(entry.name, entry.jobId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleCreateTopic = async (name: string) => {
    if (!userId) {
      toast.error('Error: Usuario no autenticado');
      return;
    }

    setCreating(name);

    try {
      const created = findTopic(await topicService.generateTopic(name), name);
      if (!created) {
        toast.error('Ocurrió un error al crear el tópico. Intenta nuevamente.');
      } else {
        addTopicIfMissing(created);
      }
      removeCreating(name);
    } catch (error) {
      notifyApiError(error, 'Ocurrió un error al crear el tópico.');
      removeCreating(name);
    }
  };

  const handleCreateTopicFromFile = async (name: string, file: File) => {
    if (!userId) {
      toast.error('Error: Usuario no autenticado');
      return;
    }

    if (!isPremium) {
      toast.error(
        'La creación de temas desde archivos es exclusiva del plan Premium. Actualizá tu plan para usarla.',
      );
      return;
    }

    setCreating(name);

    try {
      const created = await topicService.generateTopicFromFile(name, file);
      setJob(name, created.jobId);
      await watchGenerationJob(name, created.jobId);
    } catch (error) {
      notifyApiError(error, 'No se pudo procesar el archivo seleccionado.');
      removeCreating(name);
    }
  };

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Obtener tópicos que se están creando y no existen aún
  const currentlyCreating = creatingTopics.filter(
    (creatingTopic) => !hasTopic(topics, creatingTopic.name),
  );

  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-4 max-w-4xl mx-auto">
        <StreakModal />
        <Filter searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        {loading ? (
          <TopicsSkeleton />
        ) : (
          <Topics
            topics={filteredTopics}
            creatingTopics={currentlyCreating}
            onGenerateTopic={handleCreateTopic}
            onGenerateFromFile={handleCreateTopicFromFile}
          />
        )}
      </main>
    </div>
  );
}
