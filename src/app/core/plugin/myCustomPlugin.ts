import { registerPlugin } from '@capacitor/core';

export interface IMyCustomPlugin {
  setWallpaper(options: { url: string; type: 'home' | 'lock' | 'both' }): Promise<{
    success: boolean;
    error?: string;
  }>;
}

const MyCustomPlugin = registerPlugin<IMyCustomPlugin>('MyCustomPlugin');

export default MyCustomPlugin;
