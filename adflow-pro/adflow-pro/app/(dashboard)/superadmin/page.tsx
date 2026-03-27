// app/(dashboard)/superadmin/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SuperAdminClient from './SuperAdminClient';

export const metadata = { title: 'Super Admin' };

export default async function SuperAdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (profile?.role !== 'super_admin') redirect('/client');

  const { data: packages }   = await supabase.from('packages').select('*').order('sort_order');
  const { data: categories } = await supabase.from('categories').select('*').order('name');
  const { data: cities }     = await supabase.from('cities').select('*').order('name');
  const { data: users }      = await supabase.from('users').select('id,full_name,email,role,is_verified,created_at').order('created_at', { ascending: false }).limit(50);
  const { data: reports }    = await supabase.from('abuse_reports').select('*, ad:ads(title), reporter:users(full_name)').eq('status','open').order('created_at', { ascending: false });

  return <SuperAdminClient admin={profile} packages={packages??[]} categories={categories??[]} cities={cities??[]} users={users??[]} reports={reports??[]} />;
}
