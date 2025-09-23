import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase';
import { AuthService } from './auth';

export interface WallpaperUploadResult {
  url: string;
  path: string;
  fileName: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploaderService {
  private readonly BUCKET_NAME = 'wallpapers';
  
  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {}

  /**
   * Sube un wallpaper para el usuario actual
   */
  async uploadWallpaper(file: File | Blob, fileName?: string): Promise<WallpaperUploadResult> {
    const user = await this.authService.getCurrentUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    // 🔹 Generar nombre único si no se proporciona
    const finalFileName = fileName || `${Date.now()}.jpeg`;
    const filePath = `uploads/${user.uid}/${finalFileName}`;

    try {
      // 🔹 Subir archivo
      await this.supabaseService.uploadFile(this.BUCKET_NAME, filePath, file);
      
      // 🔹 Obtener URL pública
      const publicUrl = this.supabaseService.getPublicUrl(this.BUCKET_NAME, filePath);

      return {
        url: publicUrl,
        path: filePath,
        fileName: finalFileName
      };
    } catch (error) {
      console.error('❌ Error al subir wallpaper:', error);
      throw new Error(`Error al subir wallpaper: ${error}`);
    }
  }

  /**
   * Lista todos los wallpapers del usuario actual
   */
  async getUserWallpapers(): Promise<WallpaperUploadResult[]> {
    const user = await this.authService.getCurrentUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const files = await this.supabaseService.listFiles(this.BUCKET_NAME, `uploads/${user.uid}`);
      
      if (!files) {
        return [];
      }

      return files.map(file => ({
        url: this.supabaseService.getPublicUrl(this.BUCKET_NAME, `uploads/${user.uid}/${file.name}`),
        path: `uploads/${user.uid}/${file.name}`,
        fileName: file.name
      }));
    } catch (error) {
      console.error('❌ Error al obtener wallpapers:', error);
      return [];
    }
  }

  /**
   * Elimina un wallpaper específico
   */
  async deleteWallpaper(path: string): Promise<void> {
    try {
      await this.supabaseService.deleteFile(this.BUCKET_NAME, path);
      console.log('✅ Wallpaper eliminado:', path);
    } catch (error) {
      console.error('❌ Error al eliminar wallpaper:', error);
      throw new Error(`Error al eliminar wallpaper: ${error}`);
    }
  }

  /**
   * Obtiene la URL pública de un wallpaper
   */
  getWallpaperUrl(path: string): string {
    return this.supabaseService.getPublicUrl(this.BUCKET_NAME, path);
  }
}