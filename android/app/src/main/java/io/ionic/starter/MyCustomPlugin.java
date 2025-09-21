package io.ionic.starter;

import android.app.WallpaperManager;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@CapacitorPlugin(name = "MyCustomPlugin") // 👈 debe coincidir con TS
public class MyCustomPlugin extends Plugin {

  @PluginMethod()
  public void setWallpaper(PluginCall call) {   // 👈 mismo nombre que en TS
    String url = call.getString("url");
    String type = call.getString("type");

    JSObject result = new JSObject();

    if (url == null || url.isEmpty()) {
      call.reject("URL inválida");
      return;
    }

    new Thread(() -> {
      try {
        WallpaperManager wm = WallpaperManager.getInstance(getContext());
        Bitmap bitmap = downloadImage(url);

        if (bitmap != null) {
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            int flag = WallpaperManager.FLAG_SYSTEM;
            if ("lock".equals(type)) flag = WallpaperManager.FLAG_LOCK;
            if ("both".equals(type)) flag = WallpaperManager.FLAG_SYSTEM | WallpaperManager.FLAG_LOCK;

            wm.setBitmap(bitmap, null, true, flag);
          } else {
            wm.setBitmap(bitmap);
          }

          result.put("success", true);
          call.resolve(result);
        } else {
          call.reject("No se pudo descargar la imagen");
        }
      } catch (IOException e) {
        e.printStackTrace();
        call.reject("Error al aplicar wallpaper: " + e.getMessage());
      }
    }).start();
  }

  private Bitmap downloadImage(String signedUrl) {
    HttpURLConnection connection = null;
    try {
      URL url = new URL(signedUrl);
      connection = (HttpURLConnection) url.openConnection();
      connection.setDoInput(true);
      connection.connect();
      InputStream input = connection.getInputStream();
      return BitmapFactory.decodeStream(input);
    } catch (Exception e) {
      e.printStackTrace();
      return null;
    } finally {
      if (connection != null) {
        connection.disconnect();
      }
    }
  }
}
