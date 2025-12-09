import os
import requests
from typing import Dict, List, Optional, Tuple

class GoogleMapsService:
    BASE_URL = "https://maps.googleapis.com/maps/api"

    def __init__(self):
        self.api_key = os.getenv('GOOGLE_MAPS_API_KEY')

    def geocode(self, address: str):
        url = f"{self.BASE_URL}/geocode/json"
        params = {'address': address, 'key': self.api_key, 'language': 'pt-BR', 'region': 'br'}
        resp = requests.get(url, params=params)
        data = resp.json()
        if data.get('status') == 'OK' and data.get('results'):
            loc = data['results'][0]['geometry']['location']
            return {'latitude': loc['lat'], 'longitude': loc['lng'], 'formatted_address': data['results'][0]['formatted_address']}
        return None
