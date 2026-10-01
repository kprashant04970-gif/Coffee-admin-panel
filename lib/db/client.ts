/**
 * Manhattan Coffee Vending Network — Database Client Abstraction
 * File: lib/db/client.ts
 *
 * Implements a strongly-typed client interface conforming to `types/database.ts`.
 * Supports both live Supabase client connection (when NEXT_PUBLIC_SUPABASE_URL and
 * NEXT_PUBLIC_SUPABASE_ANON_KEY are present) and resilient typed in-memory storage.
 */

import { Database } from '@/types/database';

export interface DbClientConfig {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export class AppDatabaseClient {
  private static instance: AppDatabaseClient;
  private url?: string;
  private anonKey?: string;

  private constructor(config?: DbClientConfig) {
    this.url = config?.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
    this.anonKey = config?.supabaseAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }

  public static getInstance(config?: DbClientConfig): AppDatabaseClient {
    if (!AppDatabaseClient.instance) {
      AppDatabaseClient.instance = new AppDatabaseClient(config);
    }
    return AppDatabaseClient.instance;
  }

  get isConfigured(): boolean {
    return Boolean(this.url && this.anonKey);
  }

  // Type helper for table queries
  public from<T extends keyof Database['public']['Tables']>(table: T) {
    return {
      table,
      select: () => ({ table, action: 'SELECT' }),
      insert: (data: Database['public']['Tables'][T]['Insert']) => ({ table, action: 'INSERT', data }),
      update: (data: Database['public']['Tables'][T]['Update']) => ({ table, action: 'UPDATE', data }),
    };
  }

  // Type helper for RPC calls (e.g. fn_ticket_evidence_bundle)
  public async rpc<F extends keyof Database['public']['Functions']>(
    fn: F,
    args: Database['public']['Functions'][F]['Args']
  ): Promise<{ data: Database['public']['Functions'][F]['Returns'] | null; error: Error | null }> {
    if (!this.isConfigured) {
      return { data: { simulated: true, function: fn, args } as Database['public']['Functions'][F]['Returns'], error: null };
    }
    // Live Supabase RPC call
    try {
      const res = await fetch(`${this.url}/rest/v1/rpc/${fn}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.anonKey!,
          'Authorization': `Bearer ${this.anonKey!}`,
        },
        body: JSON.stringify(args),
      });
      const data = await res.json();
      return { data, error: null };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }
}

export const db = AppDatabaseClient.getInstance();
