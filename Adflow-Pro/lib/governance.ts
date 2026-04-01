import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { CategorySchema, CitySchema, PackageSchema } from '@/lib/validations';
import { createAuditLog } from '@/lib/dashboard';

const UpdatePackageSchema = PackageSchema.partial().extend({
  id: z.string().uuid(),
});

const UpdateCategorySchema = CategorySchema.partial().extend({
  id: z.string().uuid(),
});

const UpdateCitySchema = CitySchema.partial().extend({
  id: z.string().uuid(),
});

export async function createPackage(body: unknown) {
  const actor = await requireRole(['super_admin']);
  const input = PackageSchema.parse(body);
  const supabase = await createClient();
  const { data, error } = await supabase.from('packages').insert(input).select('*').single();
  if (error) throw error;

  await createAuditLog(supabase, {
    actorId: actor.id,
    actorEmail: actor.email,
    action: 'package_created',
    entityType: 'package',
    entityId: data.id,
    newData: data,
  });

  return data;
}

export async function updatePackage(body: unknown) {
  const actor = await requireRole(['super_admin']);
  const input = UpdatePackageSchema.parse(body);
  const supabase = await createClient();
  const { id, ...updates } = input;
  const cleanUpdates = Object.fromEntries(Object.entries(updates).filter(([, value]) => value !== undefined));
  const { data, error } = await supabase.from('packages').update(cleanUpdates).eq('id', id).select('*').single();
  if (error) throw error;

  await createAuditLog(supabase, {
    actorId: actor.id,
    actorEmail: actor.email,
    action: 'package_updated',
    entityType: 'package',
    entityId: id,
    newData: cleanUpdates,
  });

  return data;
}

export async function createCategory(body: unknown) {
  const actor = await requireRole(['super_admin']);
  const input = CategorySchema.parse(body);
  const supabase = await createClient();
  const { data, error } = await supabase.from('categories').insert(input).select('*').single();
  if (error) throw error;

  await createAuditLog(supabase, {
    actorId: actor.id,
    actorEmail: actor.email,
    action: 'category_created',
    entityType: 'category',
    entityId: data.id,
    newData: data,
  });

  return data;
}

export async function updateCategory(body: unknown) {
  const actor = await requireRole(['super_admin']);
  const input = UpdateCategorySchema.parse(body);
  const supabase = await createClient();
  const { id, ...updates } = input;
  const cleanUpdates = Object.fromEntries(Object.entries(updates).filter(([, value]) => value !== undefined));
  const { data, error } = await supabase.from('categories').update(cleanUpdates).eq('id', id).select('*').single();
  if (error) throw error;

  await createAuditLog(supabase, {
    actorId: actor.id,
    actorEmail: actor.email,
    action: 'category_updated',
    entityType: 'category',
    entityId: id,
    newData: cleanUpdates,
  });

  return data;
}

export async function createCity(body: unknown) {
  const actor = await requireRole(['super_admin']);
  const input = CitySchema.parse(body);
  const supabase = await createClient();
  const { data, error } = await supabase.from('cities').insert(input).select('*').single();
  if (error) throw error;

  await createAuditLog(supabase, {
    actorId: actor.id,
    actorEmail: actor.email,
    action: 'city_created',
    entityType: 'city',
    entityId: data.id,
    newData: data,
  });

  return data;
}

export async function updateCity(body: unknown) {
  const actor = await requireRole(['super_admin']);
  const input = UpdateCitySchema.parse(body);
  const supabase = await createClient();
  const { id, ...updates } = input;
  const cleanUpdates = Object.fromEntries(Object.entries(updates).filter(([, value]) => value !== undefined));
  const { data, error } = await supabase.from('cities').update(cleanUpdates).eq('id', id).select('*').single();
  if (error) throw error;

  await createAuditLog(supabase, {
    actorId: actor.id,
    actorEmail: actor.email,
    action: 'city_updated',
    entityType: 'city',
    entityId: id,
    newData: cleanUpdates,
  });

  return data;
}
