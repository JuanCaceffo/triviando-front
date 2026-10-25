import { IGenerationJobDTO } from '../types';

export const GENERATION_POLL_INTERVAL_MS = 2500;
export const GENERATION_TIMEOUT_MS = 5 * 60 * 1000;

export interface GenerationJobPollingOptions {
  fetchJob: (jobId: string) => Promise<IGenerationJobDTO>;
  onProgress?: (progress: number) => void;
  intervalMs?: number;
  timeoutMs?: number;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Consulta el job hasta que termina, falla o se agota el tiempo.
 * Las dependencias de tiempo son inyectables para poder testearlo sin timers.
 */
export async function waitForGenerationJob(
  jobId: string,
  options: GenerationJobPollingOptions,
): Promise<IGenerationJobDTO> {
  const {
    fetchJob,
    onProgress,
    intervalMs = GENERATION_POLL_INTERVAL_MS,
    timeoutMs = GENERATION_TIMEOUT_MS,
    now = Date.now,
    sleep = defaultSleep,
  } = options;

  const startedAt = now();

  while (true) {
    const job = await fetchJob(jobId);
    onProgress?.(job.progress);

    if (job.status === 'COMPLETED') {
      return job;
    }
    if (job.status === 'FAILED') {
      throw new Error(job.error || 'No se pudieron generar las preguntas');
    }
    if (now() - startedAt >= timeoutMs) {
      throw new Error('La generación está tardando más de lo esperado. Intentá nuevamente.');
    }

    await sleep(intervalMs);
  }
}
