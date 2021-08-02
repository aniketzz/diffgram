import os
import xml.etree.ElementTree as ET

result = []

for filename in os.listdir('VOCdevkit/VOC2012/Annotations'):



tree = ET.parse('country_data.xml')
root = tree.getroot()