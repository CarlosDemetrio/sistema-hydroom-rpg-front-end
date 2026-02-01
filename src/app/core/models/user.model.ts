/**
 * User model representing a system user
 * Can have dual roles: MESTRE (Game Master) and/or JOGADOR (Player)
 */
export interface User {
  id: number;
  nome: string;
  email: string;
  avatarUrl?: string;
  roles: ('MESTRE' | 'JOGADOR')[];
  dataCriacao: Date;
}

/**
 * Type guard to check if user has specific role
 */
export function hasRole(user: User | null, role: 'MESTRE' | 'JOGADOR'): boolean {
  return user?.roles.includes(role) ?? false;
}

/**
 * Check if user has both roles
 */
export function hasBothRoles(user: User | null): boolean {
  // @ts-ignore
  return user?.roles.length === 2 ?? false;
}
