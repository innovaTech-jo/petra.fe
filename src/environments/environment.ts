/** Default (local / development). Production build replaces with `environment.production.ts`. */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5048/api',
  /** Internal module uses localStorage for users/roles and static dashboard — no backend. */
  useLocalInternalStore: true
};
