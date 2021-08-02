import os
import xml.etree.ElementTree as ET
import json
result = []
directory = './../../../pytorch_obj_tutorial/VOCdevkit/VOC2012/Annotations'


def etree_to_dict(t):
    if type(t) is ET.ElementTree: return etree_to_dict(t.getroot())
    return {
        **t.attrib,
        'text': t.text,
        **{e.tag: etree_to_dict(e) for e in t}
    }

for dirpath, _, filenames in os.walk(directory):
    for f in filenames:
        final_path = os.path.abspath(os.path.join(dirpath, f))
        tree = ET.parse(final_path)
        root = tree.getroot()
        dict_data = etree_to_dict(root)
        result.append({
            'filename': dict_data['filename']['text'],
            'type': 'box',
            'class': dict_data['object']['name']['text'],
            'x_min': dict_data['object']['bndbox']['xmin']['text'],
            'x_max': dict_data['object']['bndbox']['xmax']['text'],
            'y_min': dict_data['object']['bndbox']['ymin']['text'],
            'y_max': dict_data['object']['bndbox']['ymax']['text']
        })

with open('VOC_prelabels.json', 'w') as outfile:
    json.dump(result, outfile)