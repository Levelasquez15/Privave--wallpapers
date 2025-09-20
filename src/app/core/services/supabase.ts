import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey,
      {
        auth: {
          persistSession: false
        }
      }
    );
  }

  async uploadImage(bucket: string, path: string, file: File | Blob) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;
    return data;
  }

  getPublicUrl(bucket: string, path: string) {
    const { data } = this.supabase
      .storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  }
  

  async listFiles(bucket: string, folder: string = '') {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .list(folder);

    if (error) throw error;
    return data;
  }
}
