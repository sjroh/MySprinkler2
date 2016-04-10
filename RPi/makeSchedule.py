# -*- coding: utf-8 -*-
#!/usr/bin/python

##########     imports BEGIN

import getWeathers
import driveEvents

##########     imports END

#run at 12:30am every night and first bootup
def make_schedule(prevPrecipPercentages, currPrecipPercentages, amtRainedPrevDay, newWeek):
	#NEED: 
	#amtRainedPrevDay -> rounded to .25?
	#prevPrecipPercentages -> array 0 to endOfSprinklerWk where prevPrecipPercentages[0] is yesterday's percentage
	#currPrecipPercentages -> array 0 to endOfSprinklerWk -> where [0] is today's percentage -> so size is 1 less than above
	
	thresholdCrossed = False
	origVal = [0] * len(currPrecipPercentages)
	newVal = [0] * len(currPrecipPercentages)
	for i in range(len(currPrecipPercentages):
		if thresholdCrossed == False:
			if currPrecipPercentages[i] < 40 and prevPrecipPercentages[i+1] < 40:
				thresholdCrossed = False
			elif currPrecipPercentages[i] < 60 and currPrecipPercentages[i] >= 40 and prevPrecipPercentages[i+1] < 40 and prevPrecipPercentages[i+1] >= 40:
				thresholdCrossed = False
			elif currPrecipPercentages[i] >= 60 and prevPrecipPercentages[i+1] >= 60:
				thresholdCrossed = False
			else:
				thresholdCrossed = True
	
	
	if newWeek:
		run = True
	elif thresholdCrossed || (amtRainedPrevDay > 0 && prevPrecipPercentages[0] < 40) || (amtRainedPrevDay == 0 && prevPrecipPercentages[0] >= 60)
		run = True
	else: return None
	
	if run:
		#delete all old automatic events
		#for event in EVENTS['current']:
			#if event['type'] == "auto":
				#remove_event(event['id'])
		totalWkNeed = 0;
		if SETTINGS['currLevel'] == "High":
			totalWkNeed = 2.0
		elif SETTINGS['currLevel'] == "Medium":
			totalWkNeed = 1.0
		elif SETTINGS['currLevel'] == "Low":
			totalWkNeed = 0.5
		else:
			totalWkNeed = SETTINGS['custom']['customLvl']
		neededWater = totalWkNeed - SETTINGS['watered']['wateredAmt'] - SETTINGS['watered']['rainedAmt']
		rate = SETTINGS['conversionRate']
		
		neededTime = neededWater / rate
		blocks = getTimeBlocks(neededTime)
		print "Watering time needed: ", neededTime, " hr"
		print "Water needed: ", neededWater, " inches"

		daysCanWater = 0
		for day in range(len(currPrecipPercentages)):
			if currPrecipPercentages[day] >= 60:
				removeBlock(blocks)#in anticipation of rain
				print "removed 1 block"
			
		for precip in currPrecipPercentages:
			if precip < 40:
				daysCanWater+=1
				
		numBlocks = blocks.thirty + blocks.fifteen
		
		blocks.fortyfive = 0
		blocks.sixty = 0
		continueCombining = True
		while (daysCanWater < numBlocks or numBlocks > 3) and continueCombining:#must combine blocks
			if blocks.fifteen >= 1 and blocks.thirty >= 1:
				blocks.fifteen-=1
				blocks.thirty-=1
				blocks.fortyfive+=1
				numBlocks = blocks.thirty + blocks.fifteen + blocks.fortyfive + blocks.sixty
			elif blocks.thirty > 2:
				blocks.thirty-=3
				blocks.fortyfive+=2
				numBlocks-=1
			elif blocks.thirty > 1:
				blocks.thirty -= 2
				blocks.sixty+=1
				numBlocks = blocks.thirty + blocks.fifteen + blocks.fortyfive + blocks.sixty
			else:
				continueCombining = False
		schedule = calculateBestSchedule(numBlocks, currPrecipPercentages, daysCanWater)
		
		print "Schedule: ", schedule
		
		#now add in time blocks
		timeSchedule = [0] * len(schedule)
		for i in range(len(timeSchedule)):
			if schedule[i] != False and schedule[i] != None:
				if blocks.fortyfive > 0:
					blocks.fortyfive -= 1
					timeSchedule[i] = 45
				elif blocks.thirty > 0:
					blocks.thirty -= 1
					timeSchedule[i] = 30
				elif blocks.sixty > 0:
					blocks.sixty -= 1
					timeSchedule[i] = 60
				elif blocks.fifteen > 0:# should never fail
					blocks.fifteen -= 1
					timeSchedule[i] = 15
			
		print "TimeSchedule: ", timeSchedule
		return timeSchedule

class Blocks(object):
	
	def __init__(self, thirty, fifteen):
		self.thirty = thirty
		self.fifteen = fifteen
		self.fortyfive = 0
		self.sixty = 0
		
		
def getTimeBlocks(neededTime):
	blocks30 = 0;
	blocks15 = 0;
	while neededTime >= .50:
		neededTime -= .50
		blocks30+=1
	if neededTime >= .25:
		neededTime -= .25
		blocks15+=1
	blocks = Blocks(blocks30, blocks15)
	return blocks
	
def calculateBestSchedule(blocksNum, percentages, daysCanWater):
	week = [False] * len(percentages)
	
	if daysCanWater == 0 or blocksNum == 0:#just in case -> should be fixed by combining blocks previously
		return week
	else:
		allCombos = findAllCombos(len(week), percentages, blocksNum)
		utilValues = [-1] * len(allCombos)
		evenlyDistributed = [True] * len(allCombos)#true if watering days evenly distributed
		optimalUtilValue = findOptimalUtil(allCombos[0])#use 1 combo to get numtotaldays/numwateringdays
		bestUtil = rateUtility(allCombos, utilValues, optimalUtilValue, evenlyDistributed)

		#print "evenlyDistributed: ", evenlyDistributed
		evenlyDistributedBest = []
		bestUtilValSchedules = findBest(allCombos, utilValues, evenlyDistributed, evenlyDistributedBest, bestUtil)
		
		schedule = reduceBestSchedule(bestUtilValSchedules, evenlyDistributedBest)#may be more than one with same highest util value, so eliminate all but one
		return schedule

def reduceBestSchedule(bestUtilSchedules, evenlyDistributed):
	#check if schedule exists that is not on first day ->creates a tendancy to move days to the end of the week
	if len(bestUtilSchedules[0]) >= 3:
		for i in range(len(bestUtilSchedules)):
			if evenlyDistributed[i] and (bestUtilSchedules[i][0] == False or bestUtilSchedules[i][0] == None):
				return bestUtilSchedules[i]
	if len(bestUtilSchedules[0]) >= 3:
		for i in range(len(bestUtilSchedules)):
			if evenlyDistributed[i]:
				return bestUtilSchedules[i]
	if len(bestUtilSchedules[0]) >= 3:
		for schedule in bestUtilSchedules:
			if schedule[0] == False or schedule[0] == None:
				return schedule
	
	return bestUtilSchedules[0]
		
def findBest(weeks, utilVals, evenlyDistributed, evenlyDistributedBest, best):
	bestWeeks = []
	for i in range(len(weeks)):
		if utilVals[i] == best:
			bestWeeks.append(weeks[i])
			evenlyDistributedBest.append(evenlyDistributed[i])
	return bestWeeks
		
def findOptimalUtil(combo):
	numWateringDays = 0
	for day in combo:
		if day == True:
			numWateringDays+=1
	#print "optimalvalue: ", len(combo)/numWateringDays
	return len(combo)/numWateringDays#should round down I think since both integers
		
def rateUtility(allCombos, utilValues, optimalUtilValue, evenlyDistributed):#rates schedules util values & returns best utility value
	best = 1000
	for i in range(len(allCombos)):
		utilValues[i] = utilityFunction(allCombos[i], evenlyDistributed, i)
		if abs(utilValues[i] - optimalUtilValue) < abs(best - optimalUtilValue):
			best = utilValues[i]
	return best
			
def utilityFunction(combo, evenlyDistributed, j):
	positions = []
	for i in range(len(combo)):
		if combo[i] == True :
			positions.append(copy.copy(i))#do I have to make this copy here?
	if len(positions) <= 1:
		return 0
	else:
		index = 1
		differences = []
		while(index <= len(positions) - 1):
			differences.append(positions[index] - positions[index-1])
			index+=1
			
		differencesSame = True
		for k in (range(len(differences)-1)):
			if(differences[k] != differences[k+1]):
				evenlyDistributed[j] = False
		#print evenlyDistributed[j], differences, combo
		average = sum(differences) / len(differences)
		return average
			
	
def findAllCombos(weekLength, percentages, blocksNum):
	week = [False] * len(percentages)
	for i in range(len(week)):
		if percentages[i] >= 40:
			week[i] = None
	
	#now find all combos with all days without a NONE specifier
	combos = []
	index = 0
	recursiveFind(week, combos, index)
	correctBlocksCombos = []
	foundOne = False
	counter = copy.deepcopy(blocksNum)
	while foundOne == False:	
		for weekCombo in combos:
			if wateringDays(weekCombo) == counter:
				correctBlocksCombos.append(weekCombo)
				foundOne = True
		counter-=1
	return correctBlocksCombos	

def recursiveFind(week, combos, index):#does this work in python?
	weekCopy = list(week)
	if len(weekCopy) == index:
		combos.append(weekCopy)
		return
	if weekCopy[index] == None:
		indexCopy = copy.deepcopy(index)
		indexCopy+=1
		recursiveFind(weekCopy, combos, indexCopy)
	else:
		indexCopy = copy.deepcopy(index)
		indexCopy+=1
		indexCopy2 = copy.deepcopy(index)
		indexCopy2+=1
		weekCopy[index] = True
		weekCopy2 = list(weekCopy)
		weekCopy2[index] = False
		recursiveFind(weekCopy, combos, indexCopy)
		recursiveFind(weekCopy2, combos, indexCopy2)
		
def removeBlock(blocks):
	if blocks.fifteen != 0:
		blocks.fifteen -= 1
	elif blocks.thirty != 0:
		blocks.thirty -= 1
	
def wateringDays(week):
	wateringDays = 0
	for day in week:
		if day == True:#Not False and Not None (indicating > 40% on that day)
			wateringDays+=1
	return wateringDays
	
def main():
    # should run by cron
    # update weather forcasts
    gw = getWeathers
    de = driveEvents
    

if __name__ == '__main__':
    main()
