package com.example.calendarquickstart;

import java.lang.reflect.Array;
import java.util.Calendar;
import java.util.Date;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by Abigail on 4/20/2016.
 */

public class WateringEvents {

    private List<WateringTime> wateringSchedule  = new ArrayList<WateringTime>();
    private static Date today;
    private static String td = "Mon";

    public int getListSize(){
        return wateringSchedule.size();
    }

    public void addEvent(WateringTime wt){
        wateringSchedule.add(wt);
    }

    public WateringTime getWateringTime(int dayNum) {
        return wateringSchedule.get(dayNum);
    }

    public String getToday(){
        return td;
    }

    public static void main(String args[]){
        String format = "EEE";
        SimpleDateFormat sdf = new SimpleDateFormat(format);
        today = new Date();
        td = sdf.format(today);

        System.out.println("today is:" + td);
    }
}


