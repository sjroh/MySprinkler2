# -*- coding: utf-8 -*-
#!/usr/bin/python

import getWeathers
import driveSettings
import driveEvents
import calendarEvents
import makeSchedule


# first update weather forecasts
gw = getWeathers

ds = driveSettings
ds.init() # update settings too

de = driveEvents
de.init() # update events
de.update_past_events()

cd = calendarEvents

# make schedule
ms = makeSchedule

events_list = []
events_list = ms.make_schedule()

for event in events_list:
    event_id = ce.add_event(event['sTime'], event['eTime'], event['zones'], event['type'])
    de.add_event(event_id, event['sTime'], event['eTime'], event['zones'], event['type'])
    

