/* eslint-disable @typescript-eslint/no-explicit-any */
import { suscriptionService } from '../../services/suscriptionService';

jest.mock('../../services/baseService', () => {
  class MockBaseService {
    axiosService = {
      get: jest.fn(),
      post: jest.fn(),
    };
  }
  return { BaseService: MockBaseService };
});

describe('SuscriptionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPlan', () => {
    it('debe consultar el plan Premium y devolver sus datos', async () => {
      const mockPlan = { price: 10000, currency: 'ARS', billingType: 'ONE_TIME' };
      (suscriptionService as any).axiosService.get = jest.fn().mockResolvedValue({ data: mockPlan });

      const result = await suscriptionService.getPlan();

      expect((suscriptionService as any).axiosService.get).toHaveBeenCalledWith('/suscriptions/plan');
      expect(result).toEqual(mockPlan);
    });
  });
});
