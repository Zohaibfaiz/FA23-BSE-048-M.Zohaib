import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Session, User, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { Profile, LoginCredentials, RegisterData } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase: SupabaseClient;

  currentUser = signal<User | null>(null);
  profile     = signal<Profile | null>(null);
  session     = signal<Session | null>(null);
  loading     = signal(true);

  isLoggedIn  = computed(() => !!this.currentUser());
  isAdmin     = computed(() => this.profile()?.role === 'admin');

  constructor(private supabaseService: SupabaseService, private router: Router) {
    this.supabase = this.supabaseService.client;
    this.init();
  }

  private async init() {
    const { data } = await this.supabase.auth.getSession();
    this.session.set(data.session);
    this.currentUser.set(data.session?.user ?? null);
    if (data.session?.user) await this.loadProfile(data.session.user.id);
    this.loading.set(false);

    this.supabase.auth.onAuthStateChange(async (_event, session) => {
      this.session.set(session);
      this.currentUser.set(session?.user ?? null);
      if (session?.user) {
        await this.loadProfile(session.user.id);
      } else {
        this.profile.set(null);
      }
    });
  }

  async loadProfile(userId: string) {
    const { data } = await this.supabase
      .from('profiles').select('*').eq('id', userId).single();
    if (data) this.profile.set(data as Profile);
  }

  async login(creds: LoginCredentials) {
    const { data, error } = await this.supabase.auth.signInWithPassword(creds);
    if (error) throw error;
    return data;
  }

  async register(reg: RegisterData) {
    const { data, error } = await this.supabase.auth.signUp({
      email: reg.email,
      password: reg.password,
      options: { data: { full_name: reg.full_name, phone: reg.phone } },
    });
    if (error) throw error;
    return data;
  }

  async logout() {
    await this.supabase.auth.signOut();
    this.router.navigate(['/auth/login']);
  }

  async forgotPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  }

  async updatePassword(newPassword: string) {
    const { error } = await this.supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }

  async updateProfile(updates: Partial<Profile>) {
    const user = this.currentUser();
    if (!user) return;
    const { data, error } = await this.supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id).select().single();
    if (error) throw error;
    if (data) this.profile.set(data as Profile);
    return data;
  }
}
