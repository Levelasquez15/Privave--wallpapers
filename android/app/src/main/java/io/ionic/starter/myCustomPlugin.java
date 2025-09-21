package io.ionic.starter;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;


import android.app.WallpaperManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@CapacitorPlugin(name = "MyCustomPlugin") // 👈 Debe coincidir con el nombre en myCustomPlugin.ts
public class myCustomPlugin extends Plugin {

  @PluginMethod()
  public void setWallpaper(PluginCall call) {
    String imageUrl = call.getString("url");
    String type = call.getString("type"); // "home", "lock", "both"

    JSObject ret = new JSObject();

    try {
      // Descargar imagen desde la URL
      URL url = new URL(imageUrl);
      HttpURLConnection connection = (HttpURLConnection) url.openConnection();
      connection.setDoInput(true);
      connection.connect();
      InputStream input = connection.getInputStream();
      Bitmap bitmap = BitmapFactory.decodeStream(input);

      WallpaperManager wm = WallpaperManager.getInstance(getContext());

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        if ("home".equals(type)) {
          wm.setBitmap(bitmap, null, true, WallpaperManager.FLAG_SYSTEM);
        } else if ("lock".equals(type)) {
          wm.setBitmap(bitmap, null, true, WallpaperManager.FLAG_LOCK);
        } else {
          wm.setBitmap(bitmap, null, true, WallpaperManager.FLAG_SYSTEM);
          wm.setBitmap(bitmap, null, true, WallpaperManager.FLAG_LOCK);
        }
      } else {
        // Compatibilidad con versiones antiguas
        wm.setBitmap(bitmap);
      }

      ret.put("success", true);
      call.resolve(ret);

    } catch (Exception e) {
      ret.put("success", false);
      ret.put("error", e.getMessage());
      call.resolve(ret); // 👈 usamos resolve en vez de reject
    }
  }
}
