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
    console.log(`⬆️ Subiendo imagen a bucket: ${bucket}, path: ${path}`);
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('❌ Error al subir imagen:', error);
      throw error;
    }
    console.log('✅ Imagen subida:', data);
    return data;
  }

  getPublicUrl(bucket: string, path: string) {
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(path);
    console.log(`🌐 URL pública generada para ${path}:`, data.publicUrl);
    return data.publicUrl;
  }

  async listFiles(bucket: string, folder: string = '') {
    console.log(`📂 Listando archivos en bucket: ${bucket}, carpeta: ${folder}`);
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .list(folder);

    if (error) {
      console.error('❌ Error al listar archivos:', error);
      throw error;
    }
    console.log('✅ Archivos encontrados:', data);
    return data;
  }

  async deleteFile(bucket: string, path: string) {
    console.log(`🗑 Eliminando archivo en bucket: ${bucket}, path: ${path}`);
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('❌ Error al eliminar archivo:', error);
      throw error;
    }
    console.log('✅ Archivo eliminado correctamente:', path);
  }
}
