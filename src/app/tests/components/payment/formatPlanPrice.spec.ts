import { formatPlanPrice } from '@/app/(pages)/payment/utils/formatPlanPrice';

describe('formatPlanPrice', () => {
  it('formatea pesos argentinos sin decimales', () => {
    expect(formatPlanPrice(10000)).toBe('$10.000');
    expect(formatPlanPrice(2000)).toBe('$2.000');
  });

  it('usa el código de la moneda cuando no es ARS', () => {
    expect(formatPlanPrice(10000, 'USD')).toBe('USD 10.000');
  });
});
