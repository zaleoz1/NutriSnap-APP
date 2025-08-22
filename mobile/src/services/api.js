import { Platform } from 'react-native';
import { useAuth } from './AuthContext';

// Ajuste seu IP local aqui (ou use variável de ambiente no EAS)
export const BASE_URL = 'http://192.168.0.2:3000';

export async function apiFetch(path, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Erro na API');
  return data;
}
