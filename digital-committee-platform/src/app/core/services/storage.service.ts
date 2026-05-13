import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private supabase: SupabaseClient;

  constructor(private supabaseService: SupabaseService, private auth: AuthService) {
    this.supabase = this.supabaseService.client;
  }

  async uploadAvatar(file: File): Promise<string> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Not authenticated');

    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await this.supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = this.supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  }

  async uploadPaymentProof(file: File, paymentId: string): Promise<string> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Not authenticated');

    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/${paymentId}_${Date.now()}.${ext}`;

    const { error: uploadError } = await this.supabase.storage
      .from('payment-proofs')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = this.supabase.storage.from('payment-proofs').getPublicUrl(filePath);
    return data.publicUrl;
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  }
}
