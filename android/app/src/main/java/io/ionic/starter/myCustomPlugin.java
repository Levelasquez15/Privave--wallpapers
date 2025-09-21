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

@CapacitorPlugin(name = "MyCustomPlugin")
public class myCustomPlugin extends Plugin {

  @PluginMethod()
  public void setWallpaper(PluginCall call) {
    String imageUrl = call.getString("url");
    String type = call.getString("type");

    JSObject ret = new JSObject();

    try {
      // Descargar imagen
      URL url = new URL(imageUrl);
      HttpURLConnection connection = (HttpURLConnection) url.openConnection();
      connection.setDoInput(true);
      connection.connect();
      InputStream input = connection.getInputStream();
      Bitmap bitmap = BitmapFactory.decodeStream(input);

      WallpaperManager wm = WallpaperManager.getInstance(getContext());

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        int flag = WallpaperManager.FLAG_SYSTEM;

        if ("lock".equals(type)) {
          flag = WallpaperManager.FLAG_LOCK;
        } else if ("both".equals(type)) {
          wm.setBitmap(bitmap, null, true, WallpaperManager.FLAG_SYSTEM);
          wm.setBitmap(bitmap, null, true, WallpaperManager.FLAG_LOCK);
          ret.put("success", true);
          call.resolve(ret);
          return;
        }

        wm.setBitmap(bitmap, null, true, flag);

      } else {
        wm.setBitmap(bitmap);
      }

      ret.put("success", true);
      call.resolve(ret);

    } catch (Exception e) {
      ret.put("success", false);
      ret.put("error", e.toString());
      call.resolve(ret);
    }
  }
}
