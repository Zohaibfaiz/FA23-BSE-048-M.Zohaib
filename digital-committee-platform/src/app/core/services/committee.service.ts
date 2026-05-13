import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Committee, CommitteeFilter, CommitteeMember, JoinRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class CommitteeService {
  private supabase: SupabaseClient;

  constructor(private supabaseService: SupabaseService, private auth: AuthService) {
    this.supabase = this.supabaseService.client;
  }

  async getPublicCommittees(filter?: CommitteeFilter): Promise<Committee[]> {
    let q = this.supabase
      .from('committees')
      .select('*, creator:profiles!creator_id(full_name, avatar_url, reputation_score)')
      .eq('is_public', true).neq('status', 'cancelled');

    if (filter?.search)    q = (q as any).ilike('title', `%${filter.search}%`);
    if (filter?.status)    q = (q as any).eq('status', filter.status);
    if (filter?.minAmount) q = (q as any).gte('monthly_amount', filter.minAmount);
    if (filter?.maxAmount) q = (q as any).lte('monthly_amount', filter.maxAmount);
    if (filter?.duration)  q = (q as any).eq('duration_months', filter.duration);

    const sortCol = filter?.sortBy || 'created_at';
    const sortAsc = filter?.sortDir === 'asc';
    q = (q as any).order(sortCol, { ascending: sortAsc });

    const { data, error } = await q;
    if (error) throw error;
    return (data || []) as Committee[];
  }

  async getMyCommittees(): Promise<Committee[]> {
    const user = this.auth.currentUser();
    if (!user) return [];
    const { data: memberData } = await this.supabase
      .from('committee_members').select('committee_id').eq('user_id', user.id);
    const memberIds = (memberData || []).map((m: any) => m.committee_id);

    const { data, error } = await this.supabase
      .from('committees').select('*')
      .or(`creator_id.eq.${user.id}${memberIds.length ? `,id.in.(${memberIds.join(',')})` : ''}`)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data || []) as Committee[];
  }

  async getById(id: string): Promise<Committee | null> {
    const { data, error } = await this.supabase
      .from('committees')
      .select('*, creator:profiles!creator_id(*), members:committee_members(*, profile:profiles(*))')
      .eq('id', id).single();
    if (error) return null;
    return data as Committee;
  }

  async create(committee: Partial<Committee>): Promise<Committee> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await this.supabase
      .from('committees')
      .insert({ ...committee, creator_id: user.id, current_members: 1, status: 'pending', current_month: 0 })
      .select().single();
    if (error) throw error;
    return data as Committee;
  }

  async update(id: string, updates: Partial<Committee>): Promise<Committee> {
    const { data, error } = await this.supabase
      .from('committees')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (error) throw error;
    return data as Committee;
  }

  async delete(id: string) {
    const { error } = await this.supabase.from('committees').delete().eq('id', id);
    if (error) throw error;
  }

  async getMembers(committeeId: string): Promise<CommitteeMember[]> {
    const { data } = await this.supabase
      .from('committee_members').select('*, profile:profiles(*)')
      .eq('committee_id', committeeId).eq('status', 'active').order('turn_number');
    return (data || []) as CommitteeMember[];
  }

  async removeMember(memberId: string) {
    const { error } = await this.supabase
      .from('committee_members').update({ status: 'removed' }).eq('id', memberId);
    if (error) throw error;
  }

  async requestJoin(committeeId: string, message?: string): Promise<JoinRequest> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await this.supabase
      .from('join_requests')
      .insert({ committee_id: committeeId, user_id: user.id, message, status: 'pending' })
      .select().single();
    if (error) throw error;
    return data as JoinRequest;
  }

  async getJoinRequests(committeeId: string): Promise<JoinRequest[]> {
    const { data } = await this.supabase
      .from('join_requests').select('*, profile:profiles(*)')
      .eq('committee_id', committeeId).eq('status', 'pending');
    return (data || []) as JoinRequest[];
  }

  async approveJoin(requestId: string, committeeId: string, userId: string): Promise<void> {
    await this.supabase.from('join_requests').update({ status: 'approved' }).eq('id', requestId);
    const { data: existing } = await this.supabase
      .from('committee_members').select('turn_number')
      .eq('committee_id', committeeId).order('turn_number', { ascending: false }).limit(1);
    const nextTurn = ((existing?.[0] as any)?.turn_number ?? 0) + 1;
    await this.supabase.from('committee_members').insert({
      committee_id: committeeId, user_id: userId, turn_number: nextTurn, status: 'active',
    });
  }

  async rejectJoin(requestId: string): Promise<void> {
    await this.supabase.from('join_requests').update({ status: 'rejected' }).eq('id', requestId);
  }
}
