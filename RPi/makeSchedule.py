# -*- coding: utf-8 -*-
#!/usr/bin/python

##########     imports BEGIN

import getWeathers
import driveEvents

##########     imports END

#run at 12:30am every night and first bootup
def make_schedule():
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
				blocks.fifteen--
				blocks.thirty--
				blocks.fortyfive+=1
				numBlocks = blocks.thirty + blocks.fifteen + blocks.fortyfive + blocks.sixty
			else if blocks.thirty > 1:
				blocks.thirty -= 2
				blocks.sixty+=1
				numBlocks = blocks.thirty + blocks.fifteen + blocks.fortyfive + blocks.sixty
			else:
				continueCombining = False
		schedules = calculateBestSchedule(numBlocks, currPrecipPercentages, daysCanWater)
    return True

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
		maxUtil = rateUtility(allCombos, utilValues)
		optimalUtilValue = findOptimalUtil(allCombos[0])#use 1 combo to get numtotaldays/numwateringdays
		highestUtilValSchedules = findHighest(allCombos, utilValues, maxUtil)
		return highestUtilValSchedules
		
def findHighest(weeks, utilVals, max):
	maxWeeks = []
	for i in range(len(weeks)):
		if utilVals[i] == max:
			maxWeeks.append(weeks[i])
	return maxWeeks
		
def findOptimalUtil(combo):
	numWateringDays = 0
	for day in combo:
		if day == True:
			numWateringDays+=1

	return len(combo)/numWateringDays#should round down I think since both integers
		
def rateUtility(allCombos, utilValues):
	maxUtil = -1
	for i in range(len(allCombos)):
		utilValues[i] = utilityFunction(allCombos[i])
		if utilValues[i] > maxUtil:
			maxUtil = utilValues[i]
	return maxUtil
			
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
