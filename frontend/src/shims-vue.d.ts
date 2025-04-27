declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

import { Ref, ComputedRef } from 'vue'
import type { User } from './types'

declare global {
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }
  
  interface AuthStore {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (credentials: { email: string; password: string }) => Promise<any>;
    register: (data: { name: string; email: string; password: string }) => Promise<any>;
    logout: () => Promise<void>;
    getUser: () => Promise<User | null>;
    updateUserDetails: (data: { name?: string; email?: string }) => Promise<User>;
    updatePassword: (data: { currentPassword: string; newPassword: string }) => Promise<boolean>;
  }
} 