import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Notification } from '../models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private supabase: SupabaseClient;
  notifications = signal<Notification[]>([]);
  unreadCount   = signal(0);
  private channel: any;

  constructor(private supabaseService: SupabaseService, private auth: AuthService) {
    this.supabase = this.supabaseService.client;
  }

  async load() {
    const user = this.auth.currentUser();
    if (!user) return;
    const { data } = await this.supabase
      .from('notifications').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(50);
    if (data) {
      this.notifications.set(data as Notification[]);
      this.unreadCount.set(data.filter((n: any) => !n.is_read).length);
    }
  }

  subscribeRealtime() {
    const user = this.auth.currentUser();
    if (!user) return;
    this.channel = this.supabase
      .channel('notifications-' + user.id)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const n = payload.new as Notification;
        this.notifications.update(ns => [n, ...ns]);
        this.unreadCount.update(c => c + 1);
      })
      .subscribe();
  }

  unsubscribeRealtime() {
    if (this.channel) this.supabase.removeChannel(this.channel);
  }

  async markAllRead() {
    const user = this.auth.currentUser();
    if (!user) return;
    await this.supabase.from('notifications').update({ is_read: true })
      .eq('user_id', user.id).eq('is_read', false);
    this.notifications.update(ns => ns.map(n => ({ ...n, is_read: true })));
    this.unreadCount.set(0);
  }

  async markRead(id: string) {
    await this.supabase.from('notifications').update({ is_read: true }).eq('id', id);
    this.notifications.update(ns => ns.map(n => n.id === id ? { ...n, is_read: true } : n));
    this.unreadCount.update(c => Math.max(0, c - 1));
  }

  async create(userId: string, type: string, title: string, message: string, data?: any) {
    await this.supabase.from('notifications').insert({ user_id: userId, type, title, message, data });
  }
}

import { signal } from '@angular/core';
