# -*- coding: utf-8 -*-
#!/usr/bin/python

##########     imports BEGIN

import getWeathers
import driveEvents

##########     imports END

#run at 12:30am every night and first bootup
def make_schedule():
	#NEED: 
	#amtRainedPrevDay
	#prevDaysPrecipPercentages -> array
	#currDaysPrecipPercentages -> array
	

	#if any weather percentage threshold crossed || it rained the previous day
	#then run algorithm
		#delete all old automatic events
		for event in EVENTS['current']:
			if event['type'] == "auto":
				remove_event(event['id'])
		totalWkNeed = 0;
		if SETTINGS['currLevel'] == "High":
			totalWkNeed = 2
		else if SETTINGS['currLevel'] == "Medium":
			totalWkNeed = 1
		else if SETTINGS['currLevel'] == "Low":
			totalWkNeed = 0.5
		else
			totalWkNeed = SETTINGS['custom']['customLvl']
		neededWater = totalWkNeed - SETTINGS['watered']['rainedAmt'] - SETTINGS['watered']['rainedAmt']
		rate = SETTINGS['conversionRate']
		
		neededTime = neededWater / rate
		blocks = getTimeBlocks(neededTime)
	
    return True

def getTimeBlocks(neededTime):
	blocks30 = 0;
	blocks15 = 0;
	while neededTime >= .50:
		neededTime -= .50
		blocks30++
	if neededTime == .25
		neededTime -= .25
		blocks15++
	blocks.thirty = blocks30
	blocks.fifteen = blocks15
	return blocks
	
def main():
    # should run by cron
    # update weather forcasts
    gw = getWeathers
    de = driveEvents
    

if __name__ == '__main__':
    main()
