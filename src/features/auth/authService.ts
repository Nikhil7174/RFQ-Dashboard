import { User, Role } from '@/lib/types';
import { storage } from '@/lib/storage';

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Mock authentication service
 * Uses localStorage to persist users
 */

export const authService = {
  signUp: async (data: SignUpData): Promise<{ user: User; token: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const users = storage.getUsersDB();

    // Check if user already exists
    if (users.find((u: any) => u.email === data.email)) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      role: data.role || 'viewer',
    };

    // Store password separately (in production, this would be hashed)
    const userWithPassword = {
      ...newUser,
      password: data.password,
    };

    users.push(userWithPassword);
    storage.setUsersDB(users);

    // Generate mock JWT token
    const token = btoa(
      JSON.stringify({
        sub: newUser.id,
        role: newUser.role,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      })
    );

    return { user: newUser, token };
  },

  signIn: async (data: SignInData): Promise<{ user: User; token: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const users = storage.getUsersDB();
    const userWithPassword = users.find(
      (u: any) => u.email === data.email && u.password === data.password
    );

    if (!userWithPassword) {
      throw new Error('Invalid credentials');
    }

    const { password, ...user } = userWithPassword;

    // Generate mock JWT token
    const token = btoa(
      JSON.stringify({
        sub: user.id,
        role: user.role,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      })
    );

    return { user, token };
  },

  forgotPassword: async (email: string): Promise<void> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const users = storage.getUsersDB();
    const user = users.find((u: any) => u.email === email);

    if (!user) {
      throw new Error('User not found');
    }

    // Mock: just succeed without sending email
    return;
  },
};
