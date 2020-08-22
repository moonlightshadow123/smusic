import re, io, os, json

siteRoot = "http://mysmusic.s3-website.us-east-2.amazonaws.com/songs/"
configFile = "data.json"
filesDir = "../songs"

class Song:
	def __init__(self, filename):
		self.filename = filename
		self.url = siteRoot + filename
		self.getName()

	def getName(self):
		self.name = self.filename.split(".")[0]

	def toJson(self):
		res = {"url": self.url, "name":self.name}
		return res

def getFileDict():
	res = []
	lists = os.listdir(filesDir)
	for num,songfile in enumerate(lists):
		song = Song(songfile)
		each = song.toJson()
		each["index"] = num+1
		res.append(each)
	return res

if __name__ == "__main__":
	res = getFileDict()
	print(res)
	print(json)
	with open(configFile, "w") as f:
		json.dump(res, f, indent=4)
