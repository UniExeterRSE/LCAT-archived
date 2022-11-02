import os

for root,dirs,files in os.walk("orig/"):
	for file in files:
		c=f'scour -i "orig/{file}" -o "{file}"'
		print(c)
		os.system(c)

