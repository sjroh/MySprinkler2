package com.example.calendarquickstart;

/**
 * Created by Abigail on 4/20/2016.
 */
public class WateringTime{
    private String day ="Monday";
    private String start_time="1pm";
    private String end_time="2pm";

    public void setTime(String day, String start, String stop){
        this.day = day;
        this.start_time = start;
        this.end_time = stop;
    }

    public void setDay(String day){this.day = day;}

    public void setStart(String start){this.start_time = start;}

    public void setEnd(String stop){this.end_time = stop;}

    public String getDay(){return this.day;}

    public String getStart(){return this.start_time;}

    public String getEnd(){return this.end_time;}

}