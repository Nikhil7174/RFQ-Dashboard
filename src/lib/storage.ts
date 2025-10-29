/**
 * localStorage utilities with type safety
 */

const STORAGE_KEYS = {
  AUTH_TOKEN: 'pactle_auth_token',
  USER: 'pactle_user',
  USERS_DB: 'pactle_users_db',
  QUOTATION_COMMENTS: 'pactle_quotation_comments',
} as const;

export const storage = {
  setToken: (token: string) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  removeToken: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  setUser: (user: any) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getUser: () => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  removeUser: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  getUsersDB: (): any[] => {
    const db = localStorage.getItem(STORAGE_KEYS.USERS_DB);
    return db ? JSON.parse(db) : [];
  },

  setUsersDB: (users: any[]) => {
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
  },

  // Quotation comments cache: { [quotationId]: Comment[] }
  getQuotationCommentsMap: (): Record<string, any[]> => {
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTATION_COMMENTS);
    return raw ? JSON.parse(raw) : {};
  },

  setQuotationCommentsMap: (map: Record<string, any[]>) => {
    localStorage.setItem(STORAGE_KEYS.QUOTATION_COMMENTS, JSON.stringify(map));
  },

  getCommentsForQuotation: (quotationId: string): any[] | null => {
    const map = storage.getQuotationCommentsMap();
    return map[quotationId] ?? null;
  },

  setCommentsForQuotation: (quotationId: string, comments: any[]) => {
    const map = storage.getQuotationCommentsMap();
    map[quotationId] = comments;
    storage.setQuotationCommentsMap(map);
  },

  clear: () => {
    localStorage.clear();
  },
};
