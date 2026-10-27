import { BaseService } from './baseService';

export interface ISubscriptionPlan {
  price: number;
  currency: string;
  billingType: 'ONE_TIME';
}

class SuscriptionService extends BaseService {
  getCheckoutUrlForSubscription = async ({ email }: { email: string }) => {
    const { data } = await this.axiosService.post(`/suscriptions?email=${email}`);
    return data;
  };

  getPlan = async (): Promise<ISubscriptionPlan> => {
    const { data } = await this.axiosService.get<ISubscriptionPlan>('/suscriptions/plan');
    return data;
  };
}

export const suscriptionService = new SuscriptionService();
