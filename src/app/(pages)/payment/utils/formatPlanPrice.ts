const amountFormatter = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

/**
 * Formatea el precio del plan en pesos argentinos sin decimales.
 * Para otras monedas usa el código ISO como prefijo.
 */
export const formatPlanPrice = (price: number, currency = 'ARS'): string => {
  const amount = amountFormatter.format(price);
  return currency === 'ARS' ? `$${amount}` : `${currency} ${amount}`;
};
