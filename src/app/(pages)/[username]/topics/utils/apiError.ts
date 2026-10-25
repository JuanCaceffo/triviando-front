import axios from 'axios';
import { toast } from 'react-toastify';
import { handleError } from '@/app/utils/errorHandler';

/**
 * Unifica el manejo de errores de la página: los Axios pasan por handleError
 * (que conoce los códigos del backend) y el resto muestra su propio mensaje.
 */
export const notifyApiError = (error: unknown, fallback: string): void => {
  if (axios.isAxiosError(error)) {
    handleError(error);
    return;
  }

  toast.error(error instanceof Error && error.message ? error.message : fallback);
};
