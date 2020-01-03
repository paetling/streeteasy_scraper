def transform_data_to_text(details):
    stringLine = ''
    stringLine += str(details['price']) + ','
    stringLine += str(details.get('squareFeet')) + ','
    stringLine += str(details['beds']) + ','
    stringLine += str(details.get('baths')) + ','
    stringLine += str(details['yearBuilt']) + ','
    stringLine += str(details['homeType']) + ','
    stringLine += details['url'] + ','
    stringLine += details['address'].replace(',', ':') + ','
    stringLine += str(details['agentsList']).replace(',', ':') + ','
    stringLine += str(details['rooms']) + ','
    stringLine += details['description'].replace(',', ':')
    return stringLine

def transform_all_house_data(allHouses):
    final_string = ''
    for house in allHouses:
        final_string += (transform_data_to_text(house) + 'NEWLINE')

    return final_string
