import {
  GenerationJobPollingOptions,
  waitForGenerationJob,
} from '@/app/(pages)/[username]/topics/utils/pollGenerationJob';
import { IGenerationJobDTO, GenerationJobStatus } from '@/app/(pages)/[username]/topics/types';

const buildJob = (
  status: GenerationJobStatus,
  progress = 0,
  error: string | null = null,
): IGenerationJobDTO => ({
  jobId: 'job1',
  topic: 'Biología',
  status,
  progress,
  result: null,
  error,
});

const runPolling = (
  statuses: Array<{ status: GenerationJobStatus; progress?: number; error?: string | null }>,
  overrides: Partial<GenerationJobPollingOptions> = {},
) => {
  let index = 0;
  const fetchJob = jest.fn(async () => {
    const current = statuses[Math.min(index, statuses.length - 1)];
    index += 1;
    return buildJob(current.status, current.progress ?? 0, current.error ?? null);
  });

  const options: GenerationJobPollingOptions = {
    fetchJob,
    sleep: async () => undefined,
    ...overrides,
  };

  return { fetchJob, promise: waitForGenerationJob('job1', options) };
};

describe('waitForGenerationJob', () => {
  it('devuelve el job cuando se completa y reporta el progreso', async () => {
    const onProgress = jest.fn();
    const { promise } = runPolling(
      [
        { status: 'PENDING', progress: 0 },
        { status: 'PROCESSING', progress: 50 },
        { status: 'COMPLETED', progress: 100 },
      ],
      { onProgress },
    );

    const job = await promise;

    expect(job.status).toBe('COMPLETED');
    expect(onProgress.mock.calls.map(([progress]) => progress)).toEqual([0, 50, 100]);
  });

  it('lanza el error del job cuando falla', async () => {
    const { promise } = runPolling([
      { status: 'PROCESSING', progress: 30 },
      { status: 'FAILED', error: 'Se cayó el LLM' },
    ]);

    await expect(promise).rejects.toThrow('Se cayó el LLM');
  });

  it('usa un mensaje por defecto si el job falla sin detalle', async () => {
    const { promise } = runPolling([{ status: 'FAILED' }]);

    await expect(promise).rejects.toThrow('No se pudieron generar las preguntas');
  });

  it('corta por timeout si el job nunca termina', async () => {
    let clock = 0;
    const now = () => {
      const current = clock;
      clock += 1000;
      return current;
    };

    const { fetchJob, promise } = runPolling(
      [{ status: 'PROCESSING', progress: 10 }],
      { timeoutMs: 2500, now },
    );

    await expect(promise).rejects.toThrow('La generación está tardando más de lo esperado');
    expect(fetchJob).toHaveBeenCalledTimes(3);
  });

  it('espera el intervalo configurado entre consultas', async () => {
    const sleep = jest.fn().mockResolvedValue(undefined);
    const { promise } = runPolling(
      [{ status: 'PROCESSING' }, { status: 'COMPLETED' }],
      { sleep, intervalMs: 1234 },
    );

    await promise;

    expect(sleep).toHaveBeenCalledWith(1234);
  });
});
