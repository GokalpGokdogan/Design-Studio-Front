'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMe } from '../lib/api';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const me = await getMe();
      setIsAuthenticated(true);
      setUserId(me.user_id || me.userId || me.id || null);
    } catch {
      setIsAuthenticated(false);
      setUserId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { isAuthenticated, userId, loading, refresh };
};