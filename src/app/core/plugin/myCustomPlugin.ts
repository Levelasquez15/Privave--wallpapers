import { registerPlugin } from '@capacitor/core';

export interface IMyCustomPlugin {
  setWallpaper(options: { url: string; type: string }): Promise<{ success: boolean; error?: string }>;
}

const MyCustomPlugin = registerPlugin<IMyCustomPlugin>('MyCustomPlugin');
export default MyCustomPlugin;
