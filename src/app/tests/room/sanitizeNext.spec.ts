import {
  getNextFromLocation,
  resolvePostLoginPath,
  sanitizeNext,
} from '@/app/utils/auth/sanitizeNext';

describe('sanitizeNext', () => {
  it('acepta solo rutas de sala válidas', () => {
    expect(sanitizeNext('/room/ABC123')).toBe('/room/ABC123');
    expect(sanitizeNext('/room/abc234')).toBe('/room/abc234');
  });

  it('rechaza rutas externas, arbitrarias o incompletas', () => {
    expect(sanitizeNext(null)).toBeNull();
    expect(sanitizeNext('')).toBeNull();
    expect(sanitizeNext('/payment')).toBeNull();
    expect(sanitizeNext('/room/ABC')).toBeNull();
    expect(sanitizeNext('/room/ABC123/extra')).toBeNull();
    expect(sanitizeNext('//evil.com/room/ABC123')).toBeNull();
    expect(sanitizeNext('https://evil.com/room/ABC123')).toBeNull();
    expect(sanitizeNext('/room/../admin')).toBeNull();
  });

  it('resuelve el destino post-login con fallback a topics', () => {
    expect(resolvePostLoginPath('juan', '/room/ABC123')).toBe('/room/ABC123');
    expect(resolvePostLoginPath('juan', 'https://evil.com')).toBe('/juan/topics');
    expect(resolvePostLoginPath('juan', null)).toBe('/juan/topics');
  });

  it('lee el next desde la URL actual', () => {
    const original = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState({}, '', '/login?next=%2Froom%2FABC123');
    expect(getNextFromLocation()).toBe('/room/ABC123');

    window.history.replaceState({}, '', '/login?next=https%3A%2F%2Fevil.com');
    expect(getNextFromLocation()).toBeNull();

    window.history.replaceState({}, '', original);
  });
});
