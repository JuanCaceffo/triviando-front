import { notifyApiError } from '@/app/(pages)/[username]/topics/utils/apiError';
import { handleError } from '@/app/utils/errorHandler';
import { toast } from 'react-toastify';

jest.mock('@/app/utils/errorHandler', () => ({
  handleError: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: { error: jest.fn() },
}));

describe('notifyApiError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delega en handleError cuando el error es de Axios', () => {
    notifyApiError({ isAxiosError: true }, 'fallback');

    expect(handleError).toHaveBeenCalledWith({ isAxiosError: true });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('muestra el mensaje de un Error común', () => {
    notifyApiError(new Error('La generación expiró'), 'fallback');

    expect(toast.error).toHaveBeenCalledWith('La generación expiró');
    expect(handleError).not.toHaveBeenCalled();
  });

  it('usa el mensaje por defecto para errores desconocidos', () => {
    notifyApiError('algo raro', 'No se pudo completar la operación');

    expect(toast.error).toHaveBeenCalledWith('No se pudo completar la operación');
  });
});
