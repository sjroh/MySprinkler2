package com.example.calendarquickstart;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.StrictMode;
import android.preference.PreferenceManager;
import android.widget.RemoteViews;
import android.widget.Toast;
import org.json.JSONException;
import android.os.AsyncTask;
import android.graphics.Bitmap;


/**
 * Implementation of App Widget functionality.
 */
public class NewAppWidget extends AppWidgetProvider {

    private static String forecastDaysNum = "7";
    String lang = "en";


    private class JSONForecastWeatherTask extends AsyncTask<String, Void, WeatherForecast> {
            private RemoteViews remoteViews;
            private ComponentName weatherwidget;
            private AppWidgetManager appWidgetManager;
            private Context c;

            public JSONForecastWeatherTask(Context c, AppWidgetManager appWidgetManager, ComponentName weatherwidget, RemoteViews remoteViews) {
                // Do something
                this.c = c;
                this.appWidgetManager = appWidgetManager;
                this.weatherwidget = weatherwidget;
                this.remoteViews = remoteViews;
            }
            @Override
            protected WeatherForecast doInBackground(String... params) {

                String data = ((new WeatherHttpClient()).getForecastWeatherData(params[0], params[1], params[2]));

                WeatherForecast forecast = new WeatherForecast();
                try {
                    //get weekly forecast
                    forecast = JSONWeatherParser.getForecastWeather(data);
                    // Let's retrieve the icons
                    for(int i = 0; i < forecast.getListSize(); i++){
                        forecast.getForecast(i).weather.icon_image = ( (new WeatherHttpClient()).getImage(forecast.getForecast(i).weather.currentCondition.getIcon()));
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                return forecast;
            }

            @Override
            protected void onPostExecute(WeatherForecast forecast){
                super.onPostExecute(forecast);
                //Acquire parsed data
                String location = (forecast.getCity()+ ", " + forecast.getCountry());
                remoteViews.setTextViewText(R.id.cityText, location);

                for(int i = 0; i < forecast.getListSize(); i++){
                    String index = Integer.toString(i+1);
                    String temp_name = "temp" + index;
                    String cond_name ="condIcon" + index;
                    String day_name = "day" +index;

                    String day1 = ("" + forecast.getForecast(i).getStringDate(i));
                    String temp1 = ("" + Math.round((forecast.getForecast(i).forecastTemp.day )) + "°F");
                    Bitmap img1 =  forecast.getForecast(i).weather.icon_image;

                    int temp_id = c.getResources().getIdentifier(temp_name, "id",c.getPackageName());
                    int cond_id = c.getResources().getIdentifier(cond_name, "id",c.getPackageName());
                    int day_id = c.getResources().getIdentifier(day_name, "id",c.getPackageName());


                    remoteViews.setTextViewText(temp_id, temp1);
                    remoteViews.setImageViewBitmap(cond_id, img1);
                    remoteViews.setTextViewText(day_id, day1);

                }

                /*
                //day of the week
                String day1 = ("" + forecast.getForecast(0).getStringDate(0));
                String day2 = ("" + forecast.getForecast(1).getStringDate(1));
                String day3 = ("" + forecast.getForecast(2).getStringDate(2));
                String day4 = ("" + forecast.getForecast(3).getStringDate(3));
                String day5 = ("" + forecast.getForecast(4).getStringDate(4));
                String day6 = ("" + forecast.getForecast(5).getStringDate(5));
                String day7 = ("" + forecast.getForecast(6).getStringDate(6));

                //temperature
                String temp1 = ("" + Math.round((forecast.getForecast(0).forecastTemp.day )) + "°F");
                String temp2 = ("" + Math.round((forecast.getForecast(1).forecastTemp.day )) + "°F");
                String temp3 = ("" + Math.round((forecast.getForecast(2).forecastTemp.day )) + "°F");
                String temp4 = ("" + Math.round((forecast.getForecast(3).forecastTemp.day )) + "°F");
                String temp5 = ("" + Math.round((forecast.getForecast(4).forecastTemp.day )) + "°F");
                String temp6 = ("" + Math.round((forecast.getForecast(5).forecastTemp.day )) + "°F");
                String temp7 = ("" + Math.round((forecast.getForecast(6).forecastTemp.day)) + "°F");

                //weather icon
                Bitmap img1 =  forecast.getForecast(0).weather.icon_image;
                Bitmap img2 =  forecast.getForecast(1).weather.icon_image;
                Bitmap img3 =  forecast.getForecast(2).weather.icon_image;
                Bitmap img4 =  forecast.getForecast(3).weather.icon_image;
                Bitmap img5 =  forecast.getForecast(4).weather.icon_image;
                Bitmap img6 =  forecast.getForecast(5).weather.icon_image;
                Bitmap img7 =  forecast.getForecast(6).weather.icon_image;

                //Set parsed data
                remoteViews.setTextViewText(R.id.temp1, temp1);
                remoteViews.setTextViewText(R.id.temp2, temp2);
                remoteViews.setTextViewText(R.id.temp3, temp3);
                remoteViews.setTextViewText(R.id.temp4, temp4);
                remoteViews.setTextViewText(R.id.temp5, temp5);
                remoteViews.setTextViewText(R.id.temp6, temp6);
                remoteViews.setTextViewText(R.id.temp7, temp7);

                remoteViews.setImageViewBitmap(R.id.condIcon1, img1);
                remoteViews.setImageViewBitmap(R.id.condIcon2, img2);
                remoteViews.setImageViewBitmap(R.id.condIcon3, img3);
                remoteViews.setImageViewBitmap(R.id.condIcon4, img4);
                remoteViews.setImageViewBitmap(R.id.condIcon5, img5);
                remoteViews.setImageViewBitmap(R.id.condIcon6, img6);
                remoteViews.setImageViewBitmap(R.id.condIcon7, img7);

                remoteViews.setTextViewText(R.id.day1, day1);
                remoteViews.setTextViewText(R.id.day2, day2);
                remoteViews.setTextViewText(R.id.day3, day3);
                remoteViews.setTextViewText(R.id.day4, day4);
                remoteViews.setTextViewText(R.id.day5, day5);
                remoteViews.setTextViewText(R.id.day6, day6);
                remoteViews.setTextViewText(R.id.day7, day7);
                */
                //apply all changes
                appWidgetManager.updateAppWidget(weatherwidget, remoteViews);
            }
        }

        @Override
        public void onReceive(Context context, Intent intent) {
            // Allow the network operation on main thread
            StrictMode.ThreadPolicy policy = new StrictMode.ThreadPolicy.Builder().permitNetwork().build();
            StrictMode.setThreadPolicy(policy);

            super.onReceive(context, intent);

            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.new_app_widget);
            ComponentName weatherwidget = new ComponentName(context, NewAppWidget.class);

            Toast.makeText(context, "Requested", Toast.LENGTH_SHORT).show();

            // Check the internet connection availability

            Toast.makeText(context, "Fetching Data", Toast.LENGTH_SHORT).show();
            // Update the widget weather data
            // Execute the AsyncTask
            String city = "lat=30&lon=-96";
            SharedPreferences pref = PreferenceManager.getDefaultSharedPreferences(context);
            String my_city = pref.getString("city","");
            /*if(pref.getBoolean("first_time",true)){
                editor
            }
*/
            if(my_city == null) {
                my_city = city;
                System.out.println("setting to:"+ city);
            }
            System.out.println("Setting as from pref:"+my_city);
            new JSONForecastWeatherTask(context,appWidgetManager, weatherwidget, remoteViews).execute(new String[]{my_city,lang,forecastDaysNum});

            // Apply the changes
            appWidgetManager.updateAppWidget(weatherwidget, remoteViews);
        }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int i = 0; i < appWidgetIds.length; i++) {
            int currentWidgetId = appWidgetIds[i];
            // create some random data
            RemoteViews remoteViews = new RemoteViews(context.getPackageName(),
                    R.layout.new_app_widget);
            // update remote views

            String url = "http://sjroh.github.io/MySprinkler2/";

            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            intent.setData(Uri.parse(url));

            //Intent update = new Intent(context, NewAppWidget.class);
            //PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, update, PendingIntent.FLAG_UPDATE_CURRENT);

            /*
            Intent intentSync = new Intent(context, MainActivity.class);
            intentSync.putExtra("start","get_data");
            PendingIntent pendingSync = PendingIntent.getActivity(context,0,intentSync,0);
*/
            PendingIntent pending = PendingIntent.getActivity(context, 0, intent, 0);
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.new_app_widget);
            //views.setOnClickPendingIntent(R.id.update_button,pendingIntent);
            views.setOnClickPendingIntent(R.id.button, pending);
            appWidgetManager.updateAppWidget(currentWidgetId, views);
            Toast.makeText(context, "widget added", Toast.LENGTH_SHORT).show();
        }
    }



}




/*
    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager,
                                int appWidgetId) {

        CharSequence widgetText = context.getString(R.string.appwidget_text);
        // Construct the RemoteViews object
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.new_app_widget);
        views.setTextViewText(R.id.appwidget_text, widgetText);
        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }*/


  /*@Override
        public void onEnabled(Context context) {
            // Enter relevant functionality for when the first widget is created
        }

        @Override
        public void onDisabled(Context context) {
            // Enter relevant functionality for when the last widget is disabled
        }*/