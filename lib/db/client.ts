/**
 * Manhattan Coffee Vending Network — Database Client Abstraction
 * File: lib/db/client.ts
 *
 * Implements a strongly-typed Supabase client interface conforming to `types/database.ts`
 * using the official `@supabase/supabase-js` SDK.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://manhattan-coffee.supabase.co';

const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'anon-key-placeholder';

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

export class AppDatabaseClient {
  private static instance: AppDatabaseClient;
  public client: SupabaseClient<Database>;

  private constructor() {
    this.client = supabase;
  }

  public static getInstance(): AppDatabaseClient {
    if (!AppDatabaseClient.instance) {
      AppDatabaseClient.instance = new AppDatabaseClient();
    }
    return AppDatabaseClient.instance;
  }

  public from<T extends keyof Database['public']['Tables']>(table: T) {
    return this.client.from(table);
  }

  public async rpc<F extends keyof Database['public']['Functions']>(
    fn: F,
    args: Database['public']['Functions'][F]['Args']
  ) {
    // Calls official Supabase RPC
    return (this.client.rpc as any)(fn, args);
  }
}

export const db = AppDatabaseClient.getInstance();
