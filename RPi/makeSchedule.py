# -*- coding: utf-8 -*-
#!/usr/bin/python

##########     imports BEGIN

import getWeathers
import driveEvents

##########     imports END

#run at 12:30am every night and first bootup
def make_schedule(prevPrecipPercentages, currPrecipPercentages, amtRainedPrevDay):
	#NEED: 
	#amtRainedPrevDay -> rounded to .25?
	#prevPrecipPercentages -> array 0 to endOfSprinklerWk where prevPrecipPercentages[0] is yesterday's percentage
	#currPrecipPercentages -> array 0 to endOfSprinklerWk -> where [0] is today's percentage -> so size is 1 less than above
	
	#if new week (prevDaysPrecipPercentages = null)then 
		#run = true
	#else if any weather percentage threshold crossed || (amtRainedPrevDay > 0 && prevPrecipPercentages[0] < 30) || (amtRainedPrevDay == 0 && prevPrecipPercentages[0] >= 50)
		#run = true
	#else run = false
	
	if run
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
	
		daysCanWater = 0
		for day in range(len(currPrecipPercentages)):
			if percentages[day] >= 50:
				removeBlock(blocks)
			
		for precip in currPrecipPercentages:
			if precip < 30:
				daysCanWater+=1
				
		numBlocks = blocks.thirty + blocks.fifteen
		
		blocks.fortyfive = 0
		blocks.sixty = 0
		continueCombining = True
		while daysCanWater < numBlocks and continueCombining:#must combine blocks
			if blocks.fifteen >= 1 and blocks.thirty >= 1:
				blocks.fifteen-=1
				blocks.thirty-=1
				blocks.fortyfive+=1
				numBlocks = blocks.thirty + blocks.fifteen + blocks.fortyfive + blocks.sixty
			else if blocks.thirty > 1:
				blocks.thirty -= 2
				blocks.sixty+=1
				numBlocks = blocks.thirty + blocks.fifteen + blocks.fortyfive + blocks.sixty
			else:
				continueCombining = False
		schedule = calculateBestSchedule(numBlocks, currPrecipPercentages, daysCanWater)
		
		print "With watering time total: ", neededTime
		print "Schedule: ", schedule
		
		#now add in time blocks
		timeSchedule = [0] * len(schedule)
		for i in len(timeSchedule):
			if schedule[i] != False and schedule[i] != None:
				if blocks.fortyfive > 0:
					blocks.fortyfive -= 1
					timeSchedule[i] = 45
				else if blocks.thirty > 0:
					blocks.thirty -= 1
					timeSchedule[i] = 30
				else if blocks.sixty > 0:
					blocks.sixty -= 1
					timeSchedule[i] = 60
				else if blocks.fifteen > 0:# should never fail
					blocks.fifteen -= 1
					timeSchedule[i] = 15
			
		print "TimeSchedule: ", timeSchedule
    return timeSchedule

def getTimeBlocks(neededTime):
	blocks30 = 0;
	blocks15 = 0;
	while neededTime >= .50:
		neededTime -= .50
		blocks30+=1
	if neededTime == .25
		neededTime -= .25
		blocks15+=1
	blocks.thirty = blocks30
	blocks.fifteen = blocks15
	return blocks
	
def calculateBestSchedule(blocksNum, percentages, daysCanWater):
	week = [False] * len(percentages)
	schedules = []
	
	if blocksNum > daysCanWater:#just in case -> should be fixed by combining blocks previously
		for day in week:
			day = True
		schedules.append(week)
		return schedules
	else if blocksNum == 0:
		schedules.append(week)
		return schedules
	else
		allCombos = findAllCombos(len(week), percentages, blocksNum)
		utilValues = [-1] * len(allCombos)
		optimalUtilValue = findOptimalUtil(allCombos[0])#use 1 combo to get numtotaldays/numwateringdays
		
		bestUtil = rateUtility(allCombos, utilValues, optimalUtilValue)
		bestUtilValSchedules = findBest(allCombos, utilValues, bestUtil)
		schedule = reduceBestSchedule(bestUtilValSchedules)#may be more than one with same highest util value, so eliminate all but one
		return schedule

def reduceBestSchedule(bestUtilSchedules):
	#check if schedule exists that is not on first day ->creates a tendancy to move days to the end of the week
	if len(bestUtilSchedules[0]) >= 3:
		for schedule in bestUtilSchedules:
			if schedule[0] == False or schedule[0] == None:
				return schedule
	
	return bestUtilSchedules[0]
		
def findBest(weeks, utilVals, best):
	bestWeeks = []
	for i in range(len(weeks)):
		if utilVals[i] == best:
			bestWeeks.append(weeks[i])
	return bestWeeks
		
def findOptimalUtil(combo):
	numWateringDays = 0
	for day in combo:
		if day == True:
			numWateringDays+=1

	return len(combo)/numWateringDays#should round down I think since both integers
		
def rateUtility(allCombos, utilValues, optimalUtilValue):#rates schedules util values & returns best utility value
	best = 1000
	for i in range(len(allCombos)):
		utilValues[i] = utilityFunction(allCombos[i])
		if abs(utilValues[i] - optimalUtilValue) < best:
			bestUtil = utilValues[i]
	return best
			
def utilityFunction(combo):
	positions = []
	for i in range(len(combo)):
		if combo[i] == True :
			positions.append(copy.copy(i)))#do I have to make this copy here?
			
	if len(positions) <= 1:
		return 0
	else:
		index = 1
		differences = []
		while(index <= len(positions) - 1):
			differences.append(positions[index] - positions[index-1])
		average = sum(differences) / len(differences)
		return average
			
	
def findAllCombos(weekLength, percentages, blocksNum):
	week = [False] * len(percentages)
	for i in range(len(week)):
		if percentages[i] >= 30:
			week[i] = None
	
	#now find all combos with all days without a NONE specifier
	combos = []
	index = 0
	recursiveFind(week, combos, index)
	for weekCombo in combos:
	if wateringDays(weekCombo) == blocksNum
		schedules.append(weekCombo)
	return combos	

def recursiveFind(week, combos, index):#does this work in python?
	weekCopy = list(week)
	if len(weekCopy) == index:
		combos.append(weekCopy)
		return
	if weekCopy[index] == None:
		indexCopy = copy.copy(index)
		indexCopy+=1
		recursiveFind(weekCopy, combos, indexCopy)
	else:
		indexCopy = copy.copy(index)
		indexCopy+=1
		weekCopy[index] = True
		weekCopy2 = list(weekCopy)
		weekCopy2[index] = False
		recursiveFind(weekCopy, combos, indexCopy)
		recursiveFind(weekCopy2, combos, indexCopy2)
		
def removeBlock(blocks):
	if blocks.fifteen != 0
		blocks.fifteen -= 1
	else if blocks.thirty != 0:
		blocks.thirty -= 1
	
def wateringDays(week):
	wateringDays = 0
	for day in week:
		if day == True:#Not False and Not None (indicating > 30% on that day)
			wateringDays+=1
	return wateringDays
	
def main():
    # should run by cron
    # update weather forcasts
    gw = getWeathers
    de = driveEvents
    

if __name__ == '__main__':
    main()
