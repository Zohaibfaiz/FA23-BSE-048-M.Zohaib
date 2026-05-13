import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Payment, PaymentStatus } from '../models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private supabase: SupabaseClient;

  constructor(private supabaseService: SupabaseService, private auth: AuthService) {
    this.supabase = this.supabaseService.client;
  }

  async getCommitteePayments(committeeId: string): Promise<Payment[]> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*, member:committee_members(*, profile:profiles(full_name, avatar_url))')
      .eq('committee_id', committeeId)
      .order('month_number').order('member_id');
    if (error) throw error;
    return (data || []) as Payment[];
  }

  async getMyPayments(committeeId?: string): Promise<Payment[]> {
    const user = this.auth.currentUser();
    if (!user) return [];
    let q = this.supabase
      .from('payments')
      .select('*, committee:committees(title, monthly_amount)')
      .eq('member_id', user.id) as any;
    if (committeeId) q = q.eq('committee_id', committeeId);
    const { data } = await q.order('due_date', { ascending: false });
    return (data || []) as Payment[];
  }

  async markPaid(paymentId: string, transactionId: string, proofUrl?: string): Promise<Payment> {
    const { data, error } = await this.supabase
      .from('payments')
      .update({
        status: 'paid', transaction_id: transactionId,
        proof_url: proofUrl, paid_at: new Date().toISOString(),
      })
      .eq('id', paymentId).select().single();
    if (error) throw error;
    return data as Payment;
  }

  async verifyPayment(paymentId: string, verified: boolean): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) return;
    await this.supabase.from('payments').update({
      status: verified ? 'paid' : 'pending',
      verified_by: verified ? user.id : null,
      verified_at: verified ? new Date().toISOString() : null,
    }).eq('id', paymentId);
  }

  async generateMonthlyPayments(committeeId: string, monthNumber: number, dueDate: string): Promise<void> {
    const { data: members } = await this.supabase
      .from('committee_members').select('id, committee_id')
      .eq('committee_id', committeeId).eq('status', 'active');
    const { data: committee } = await this.supabase
      .from('committees').select('monthly_amount').eq('id', committeeId).single();
    const payments = (members || []).map((m: any) => ({
      committee_id: committeeId, member_id: m.id, month_number: monthNumber,
      amount: (committee as any)?.monthly_amount || 0,
      status: 'pending' as PaymentStatus, due_date: dueDate,
    }));
    await this.supabase.from('payments').insert(payments);
  }

  async getPaymentStats(committeeId: string) {
    const { data } = await this.supabase
      .from('payments').select('status, amount').eq('committee_id', committeeId);
    const all = data || [];
    return {
      total:   all.reduce((s: number, p: any) => s + p.amount, 0),
      paid:    all.filter((p: any) => p.status === 'paid').reduce((s: number, p: any) => s + p.amount, 0),
      pending: all.filter((p: any) => p.status === 'pending').length,
      overdue: all.filter((p: any) => p.status === 'overdue').length,
    };
  }

  subscribeRealtime(committeeId: string, callback: (p: Payment) => void) {
    return this.supabaseService.client
      .channel('payments-' + committeeId)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'payments',
        filter: `committee_id=eq.${committeeId}`,
      }, (payload: any) => callback(payload.new as Payment))
      .subscribe();
  }
}
