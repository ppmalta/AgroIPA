# Backend Django - agroIPA

## Visão Geral

Este documento descreve a arquitetura do backend Django REST Framework para o sistema agroIPA, incluindo modelos de dados, endpoints da API REST, integração com Google Maps e instruções de configuração.

## Tecnologias

- Python 3.10+
- Django 4.x
- Django REST Framework
- MySQL (via mysqlclient)
- Simple JWT para autenticação
- Google Maps Platform APIs

---

## Configuração do Ambiente

### 1. Criar Ambiente Virtual

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

### 2. Instalar Dependências

```bash
pip install django djangorestframework djangorestframework-simplejwt
pip install mysqlclient python-dotenv requests
pip install drf-spectacular  # Para documentação Swagger
pip install django-cors-headers
```

### 3. Criar Projeto Django

```bash
django-admin startproject agroipa_backend
cd agroipa_backend
python manage.py startapp core
python manage.py startapp seeds
python manage.py startapp geolocation
```

---

## Estrutura do Projeto

```
agroipa_backend/
├── agroipa_backend/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── core/
│   ├── models.py          # User, Authentication
│   ├── views.py
│   ├── serializers.py
│   └── urls.py
├── seeds/
│   ├── models.py          # Seed, Stock, Batch, Warehouse
│   ├── views.py
│   ├── serializers.py
│   └── urls.py
├── geolocation/
│   ├── models.py          # Location, DeliveryPoint
│   ├── views.py
│   ├── serializers.py
│   ├── services.py        # Google Maps integration
│   └── urls.py
├── .env
└── manage.py
```

---

## Variáveis de Ambiente (.env)

```env
# Database
DB_NAME=agroipa
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306

# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# JWT
JWT_ACCESS_TOKEN_LIFETIME=60  # minutes
JWT_REFRESH_TOKEN_LIFETIME=1440  # minutes (24 hours)

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## Configuração do Django (settings.py)

```python
import os
from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = os.getenv('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_spectacular',
    # Local apps
    'core',
    'seeds',
    'geolocation',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Database MySQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '3306'),
        'OPTIONS': {
            'charset': 'utf8mb4',
        },
    }
}

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=int(os.getenv('JWT_ACCESS_TOKEN_LIFETIME', 60))),
    'REFRESH_TOKEN_LIFETIME': timedelta(minutes=int(os.getenv('JWT_REFRESH_TOKEN_LIFETIME', 1440))),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# CORS
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')
CORS_ALLOW_CREDENTIALS = True

# Spectacular (Swagger)
SPECTACULAR_SETTINGS = {
    'TITLE': 'agroIPA API',
    'DESCRIPTION': 'API REST para gestão agrícola com geolocalização',
    'VERSION': '1.0.0',
}
```

---

## Modelos de Dados

### core/models.py - Usuários

```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """Extended User model"""
    USER_TYPES = [
        ('admin', 'Administrador'),
        ('manager', 'Gerente'),
        ('operator', 'Operador'),
        ('agent', 'Agente de Distribuição'),
    ]
    
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='operator')
    phone = models.CharField(max_length=20, blank=True)
    cpf = models.CharField(max_length=14, unique=True, null=True, blank=True)
    organization = models.CharField(max_length=200, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
```

### seeds/models.py - Sementes, Estoque e Lotes

```python
from django.db import models
from django.conf import settings

class SeedType(models.Model):
    """Tipos de sementes"""
    name = models.CharField(max_length=100)
    scientific_name = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50)  # ex: grãos, hortaliças, frutíferas
    germination_time_days = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'seed_types'

    def __str__(self):
        return self.name


class Warehouse(models.Model):
    """Armazéns/Locais de estoque"""
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    postal_code = models.CharField(max_length=20)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    capacity_kg = models.DecimalField(max_digits=12, decimal_places=2)
    manager = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'warehouses'

    def __str__(self):
        return f"{self.name} ({self.code})"


class Stock(models.Model):
    """Estoque geral por armazém e tipo de semente"""
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='stocks')
    seed_type = models.ForeignKey(SeedType, on_delete=models.CASCADE, related_name='stocks')
    total_quantity_kg = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    reserved_quantity_kg = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    minimum_quantity_kg = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'stocks'
        unique_together = ['warehouse', 'seed_type']

    @property
    def available_quantity_kg(self):
        return self.total_quantity_kg - self.reserved_quantity_kg

    def __str__(self):
        return f"{self.seed_type.name} em {self.warehouse.name}"


class Batch(models.Model):
    """Lotes de sementes"""
    QUALITY_GRADES = [
        ('A', 'Grade A - Premium'),
        ('B', 'Grade B - Standard'),
        ('C', 'Grade C - Economy'),
    ]

    STATUS_CHOICES = [
        ('available', 'Disponível'),
        ('reserved', 'Reservado'),
        ('expired', 'Vencido'),
        ('distributed', 'Distribuído'),
    ]

    batch_number = models.CharField(max_length=50, unique=True)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='batches')
    quantity_kg = models.DecimalField(max_digits=12, decimal_places=2)
    available_quantity_kg = models.DecimalField(max_digits=12, decimal_places=2)
    production_date = models.DateField()
    expiration_date = models.DateField()
    quality_grade = models.CharField(max_length=1, choices=QUALITY_GRADES)
    germination_rate = models.DecimalField(max_digits=5, decimal_places=2)  # percentual
    supplier = models.CharField(max_length=200)
    origin = models.CharField(max_length=100)  # origem/região
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'batches'
        ordering = ['expiration_date']  # Prioridade por vencimento

    def __str__(self):
        return f"Lote {self.batch_number}"

    @property
    def days_until_expiration(self):
        from datetime import date
        return (self.expiration_date - date.today()).days


class StockMovement(models.Model):
    """Movimentações de estoque"""
    MOVEMENT_TYPES = [
        ('entry', 'Entrada'),
        ('exit', 'Saída'),
        ('transfer', 'Transferência'),
        ('adjustment', 'Ajuste'),
        ('distribution', 'Distribuição'),
    ]

    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='movements')
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity_kg = models.DecimalField(max_digits=12, decimal_places=2)
    destination_warehouse = models.ForeignKey(
        Warehouse, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='incoming_movements'
    )
    reason = models.TextField(blank=True)
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'stock_movements'
        ordering = ['-created_at']


class SeedRequest(models.Model):
    """Solicitações de sementes"""
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('approved', 'Aprovado'),
        ('rejected', 'Rejeitado'),
        ('in_progress', 'Em Andamento'),
        ('delivered', 'Entregue'),
        ('cancelled', 'Cancelado'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Baixa'),
        ('medium', 'Média'),
        ('high', 'Alta'),
        ('urgent', 'Urgente'),
    ]

    request_number = models.CharField(max_length=50, unique=True)
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='seed_requests')
    seed_type = models.ForeignKey(SeedType, on_delete=models.CASCADE)
    quantity_kg = models.DecimalField(max_digits=12, decimal_places=2)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    delivery_address = models.TextField()
    delivery_city = models.CharField(max_length=100)
    delivery_state = models.CharField(max_length=50)
    delivery_latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    delivery_longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    requested_date = models.DateField()
    approved_date = models.DateField(null=True, blank=True)
    delivered_date = models.DateField(null=True, blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, 
        null=True, blank=True, related_name='approved_requests'
    )
    assigned_batch = models.ForeignKey(Batch, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'seed_requests'
        ordering = ['-created_at']

    def __str__(self):
        return f"Solicitação {self.request_number}"
```

### geolocation/models.py - Geolocalização

```python
from django.db import models
from django.conf import settings

class DeliveryPoint(models.Model):
    """Pontos de entrega/distribuição"""
    POINT_TYPES = [
        ('farm', 'sitio'),
        ('cooperative', 'Cooperativa'),
        ('association', 'Associação'),
        ('distribution_center', 'Centro de Distribuição'),
    ]

    name = models.CharField(max_length=200)
    point_type = models.CharField(max_length=30, choices=POINT_TYPES)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    postal_code = models.CharField(max_length=20)
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    contact_name = models.CharField(max_length=200)
    contact_phone = models.CharField(max_length=20)
    contact_email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'delivery_points'

    def __str__(self):
        return f"{self.name} ({self.city})"


class DeliveryRoute(models.Model):
    """Rotas de entrega"""
    STATUS_CHOICES = [
        ('planned', 'Planejada'),
        ('in_progress', 'Em Andamento'),
        ('completed', 'Concluída'),
        ('cancelled', 'Cancelada'),
    ]

    name = models.CharField(max_length=200)
    origin_warehouse = models.ForeignKey('seeds.Warehouse', on_delete=models.CASCADE)
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    planned_date = models.DateField()
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    total_distance_km = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    estimated_duration_minutes = models.IntegerField(null=True, blank=True)
    polyline = models.TextField(blank=True)  # Encoded polyline from Google Maps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'delivery_routes'


class RouteStop(models.Model):
    """Paradas da rota"""
    route = models.ForeignKey(DeliveryRoute, on_delete=models.CASCADE, related_name='stops')
    delivery_point = models.ForeignKey(DeliveryPoint, on_delete=models.CASCADE)
    seed_request = models.ForeignKey('seeds.SeedRequest', on_delete=models.SET_NULL, null=True)
    order = models.IntegerField()  # Ordem na rota
    arrived_at = models.DateTimeField(null=True, blank=True)
    departed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'route_stops'
        ordering = ['order']
```

---

## Serviço Google Maps (geolocation/services.py)

```python
import os
import requests
from typing import Dict, List, Optional, Tuple
from django.conf import settings

class GoogleMapsService:
    """Serviço de integração com Google Maps Platform"""
    
    BASE_URL = "https://maps.googleapis.com/maps/api"
    
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_MAPS_API_KEY')
    
    def geocode(self, address: str) -> Optional[Dict]:
        """
        Converte endereço em coordenadas (latitude, longitude)
        
        Args:
            address: Endereço completo
            
        Returns:
            Dict com lat, lng e formatted_address ou None
        """
        url = f"{self.BASE_URL}/geocode/json"
        params = {
            'address': address,
            'key': self.api_key,
            'language': 'pt-BR',
            'region': 'br'
        }
        
        response = requests.get(url, params=params)
        data = response.json()
        
        if data['status'] == 'OK' and data['results']:
            result = data['results'][0]
            location = result['geometry']['location']
            return {
                'latitude': location['lat'],
                'longitude': location['lng'],
                'formatted_address': result['formatted_address'],
                'place_id': result['place_id']
            }
        return None
    
    def reverse_geocode(self, latitude: float, longitude: float) -> Optional[Dict]:
        """
        Converte coordenadas em endereço
        
        Args:
            latitude: Latitude
            longitude: Longitude
            
        Returns:
            Dict com endereço formatado e componentes
        """
        url = f"{self.BASE_URL}/geocode/json"
        params = {
            'latlng': f"{latitude},{longitude}",
            'key': self.api_key,
            'language': 'pt-BR'
        }
        
        response = requests.get(url, params=params)
        data = response.json()
        
        if data['status'] == 'OK' and data['results']:
            result = data['results'][0]
            
            # Extrair componentes do endereço
            components = {}
            for component in result['address_components']:
                for comp_type in component['types']:
                    components[comp_type] = component['long_name']
            
            return {
                'formatted_address': result['formatted_address'],
                'street': components.get('route', ''),
                'number': components.get('street_number', ''),
                'neighborhood': components.get('sublocality_level_1', ''),
                'city': components.get('administrative_area_level_2', ''),
                'state': components.get('administrative_area_level_1', ''),
                'postal_code': components.get('postal_code', ''),
                'country': components.get('country', '')
            }
        return None
    
    def calculate_distance(
        self, 
        origin: Tuple[float, float], 
        destination: Tuple[float, float],
        mode: str = 'driving'
    ) -> Optional[Dict]:
        """
        Calcula distância e tempo entre dois pontos
        
        Args:
            origin: Tupla (latitude, longitude) da origem
            destination: Tupla (latitude, longitude) do destino
            mode: Modo de transporte ('driving', 'walking', 'bicycling', 'transit')
            
        Returns:
            Dict com distância e duração
        """
        url = f"{self.BASE_URL}/distancematrix/json"
        params = {
            'origins': f"{origin[0]},{origin[1]}",
            'destinations': f"{destination[0]},{destination[1]}",
            'mode': mode,
            'key': self.api_key,
            'language': 'pt-BR',
            'units': 'metric'
        }
        
        response = requests.get(url, params=params)
        data = response.json()
        
        if data['status'] == 'OK':
            element = data['rows'][0]['elements'][0]
            if element['status'] == 'OK':
                return {
                    'distance_meters': element['distance']['value'],
                    'distance_text': element['distance']['text'],
                    'duration_seconds': element['duration']['value'],
                    'duration_text': element['duration']['text']
                }
        return None
    
    def calculate_route(
        self,
        origin: Tuple[float, float],
        destination: Tuple[float, float],
        waypoints: List[Tuple[float, float]] = None,
        optimize: bool = True
    ) -> Optional[Dict]:
        """
        Calcula rota otimizada entre múltiplos pontos
        
        Args:
            origin: Ponto de origem
            destination: Ponto de destino
            waypoints: Lista de pontos intermediários
            optimize: Se deve otimizar a ordem dos waypoints
            
        Returns:
            Dict com rota, distância total, duração e polyline
        """
        url = f"{self.BASE_URL}/directions/json"
        params = {
            'origin': f"{origin[0]},{origin[1]}",
            'destination': f"{destination[0]},{destination[1]}",
            'key': self.api_key,
            'language': 'pt-BR',
            'units': 'metric'
        }
        
        if waypoints:
            wp_str = '|'.join([f"{lat},{lng}" for lat, lng in waypoints])
            if optimize:
                wp_str = f"optimize:true|{wp_str}"
            params['waypoints'] = wp_str
        
        response = requests.get(url, params=params)
        data = response.json()
        
        if data['status'] == 'OK' and data['routes']:
            route = data['routes'][0]
            legs = route['legs']
            
            total_distance = sum(leg['distance']['value'] for leg in legs)
            total_duration = sum(leg['duration']['value'] for leg in legs)
            
            return {
                'total_distance_meters': total_distance,
                'total_distance_km': round(total_distance / 1000, 2),
                'total_duration_seconds': total_duration,
                'total_duration_minutes': round(total_duration / 60),
                'polyline': route['overview_polyline']['points'],
                'waypoint_order': route.get('waypoint_order', []),
                'legs': [
                    {
                        'start_address': leg['start_address'],
                        'end_address': leg['end_address'],
                        'distance': leg['distance']['text'],
                        'duration': leg['duration']['text']
                    }
                    for leg in legs
                ]
            }
        return None
    
    def search_nearby(
        self,
        location: Tuple[float, float],
        radius: int = 5000,
        place_type: str = None,
        keyword: str = None
    ) -> List[Dict]:
        """
        Busca lugares próximos a uma localização
        
        Args:
            location: Tupla (latitude, longitude)
            radius: Raio de busca em metros (máx 50000)
            place_type: Tipo de lugar (ex: 'store', 'gas_station')
            keyword: Palavra-chave de busca
            
        Returns:
            Lista de lugares encontrados
        """
        url = f"{self.BASE_URL}/place/nearbysearch/json"
        params = {
            'location': f"{location[0]},{location[1]}",
            'radius': min(radius, 50000),
            'key': self.api_key,
            'language': 'pt-BR'
        }
        
        if place_type:
            params['type'] = place_type
        if keyword:
            params['keyword'] = keyword
        
        response = requests.get(url, params=params)
        data = response.json()
        
        places = []
        if data['status'] == 'OK':
            for place in data['results']:
                places.append({
                    'place_id': place['place_id'],
                    'name': place['name'],
                    'address': place.get('vicinity', ''),
                    'latitude': place['geometry']['location']['lat'],
                    'longitude': place['geometry']['location']['lng'],
                    'types': place.get('types', []),
                    'rating': place.get('rating'),
                    'is_open': place.get('opening_hours', {}).get('open_now')
                })
        
        return places
```

---

## Serializers

### seeds/serializers.py

```python
from rest_framework import serializers
from .models import SeedType, Warehouse, Stock, Batch, StockMovement, SeedRequest

class SeedTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeedType
        fields = '__all__'


class WarehouseSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.get_full_name', read_only=True)
    
    class Meta:
        model = Warehouse
        fields = '__all__'


class BatchSerializer(serializers.ModelSerializer):
    seed_type_name = serializers.CharField(source='stock.seed_type.name', read_only=True)
    warehouse_name = serializers.CharField(source='stock.warehouse.name', read_only=True)
    days_until_expiration = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Batch
        fields = '__all__'


class BatchPrioritySerializer(serializers.ModelSerializer):
    """Serializer para listagem de lotes por prioridade de vencimento"""
    seed_type_name = serializers.CharField(source='stock.seed_type.name', read_only=True)
    warehouse_name = serializers.CharField(source='stock.warehouse.name', read_only=True)
    days_until_expiration = serializers.IntegerField(read_only=True)
    priority_level = serializers.SerializerMethodField()
    
    class Meta:
        model = Batch
        fields = [
            'id', 'batch_number', 'seed_type_name', 'warehouse_name',
            'available_quantity_kg', 'expiration_date', 'days_until_expiration',
            'priority_level', 'quality_grade', 'status'
        ]
    
    def get_priority_level(self, obj):
        days = obj.days_until_expiration
        if days <= 0:
            return 'expired'
        elif days <= 30:
            return 'critical'
        elif days <= 90:
            return 'high'
        elif days <= 180:
            return 'medium'
        return 'low'


class StockSerializer(serializers.ModelSerializer):
    seed_type = SeedTypeSerializer(read_only=True)
    warehouse = WarehouseSerializer(read_only=True)
    available_quantity_kg = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )
    batches = BatchSerializer(many=True, read_only=True)
    
    class Meta:
        model = Stock
        fields = '__all__'


class StockMovementSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)
    
    class Meta:
        model = StockMovement
        fields = '__all__'


class SeedRequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.CharField(source='requester.get_full_name', read_only=True)
    seed_type_name = serializers.CharField(source='seed_type.name', read_only=True)
    
    class Meta:
        model = SeedRequest
        fields = '__all__'
        read_only_fields = ['request_number', 'approved_by', 'approved_date', 'delivered_date']
```

### geolocation/serializers.py

```python
from rest_framework import serializers
from .models import DeliveryPoint, DeliveryRoute, RouteStop

class DeliveryPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryPoint
        fields = '__all__'


class RouteStopSerializer(serializers.ModelSerializer):
    delivery_point = DeliveryPointSerializer(read_only=True)
    
    class Meta:
        model = RouteStop
        fields = '__all__'


class DeliveryRouteSerializer(serializers.ModelSerializer):
    stops = RouteStopSerializer(many=True, read_only=True)
    agent_name = serializers.CharField(source='agent.get_full_name', read_only=True)
    warehouse_name = serializers.CharField(source='origin_warehouse.name', read_only=True)
    
    class Meta:
        model = DeliveryRoute
        fields = '__all__'


class GeocodeRequestSerializer(serializers.Serializer):
    address = serializers.CharField(max_length=500)


class ReverseGeocodeRequestSerializer(serializers.Serializer):
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()


class DistanceRequestSerializer(serializers.Serializer):
    origin_lat = serializers.FloatField()
    origin_lng = serializers.FloatField()
    destination_lat = serializers.FloatField()
    destination_lng = serializers.FloatField()
    mode = serializers.ChoiceField(
        choices=['driving', 'walking', 'bicycling', 'transit'],
        default='driving'
    )


class RouteRequestSerializer(serializers.Serializer):
    origin_lat = serializers.FloatField()
    origin_lng = serializers.FloatField()
    destination_lat = serializers.FloatField()
    destination_lng = serializers.FloatField()
    waypoints = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        allow_empty=True
    )
    optimize = serializers.BooleanField(default=True)


class NearbySearchRequestSerializer(serializers.Serializer):
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    radius = serializers.IntegerField(default=5000, min_value=100, max_value=50000)
    place_type = serializers.CharField(required=False, allow_blank=True)
    keyword = serializers.CharField(required=False, allow_blank=True)
```

---

## Views (API Endpoints)

### seeds/views.py

```python
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, F
from datetime import date, timedelta

from .models import SeedType, Warehouse, Stock, Batch, StockMovement, SeedRequest
from .serializers import (
    SeedTypeSerializer, WarehouseSerializer, StockSerializer,
    BatchSerializer, BatchPrioritySerializer, StockMovementSerializer,
    SeedRequestSerializer
)


class SeedTypeViewSet(viewsets.ModelViewSet):
    """CRUD de tipos de sementes"""
    queryset = SeedType.objects.all()
    serializer_class = SeedTypeSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'scientific_name', 'category']
    ordering_fields = ['name', 'category', 'created_at']


class WarehouseViewSet(viewsets.ModelViewSet):
    """CRUD de armazéns"""
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'code', 'city', 'state']
    filterset_fields = ['is_active', 'state', 'city']
    
    @action(detail=True, methods=['get'])
    def stocks(self, request, pk=None):
        """Lista estoques de um armazém específico"""
        warehouse = self.get_object()
        stocks = Stock.objects.filter(warehouse=warehouse)
        serializer = StockSerializer(stocks, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def batches(self, request, pk=None):
        """Lista todos os lotes de um armazém"""
        warehouse = self.get_object()
        batches = Batch.objects.filter(
            stock__warehouse=warehouse,
            status='available'
        ).order_by('expiration_date')
        serializer = BatchSerializer(batches, many=True)
        return Response(serializer.data)


class StockViewSet(viewsets.ModelViewSet):
    """CRUD de estoques"""
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['warehouse', 'seed_type']
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Lista estoques abaixo do mínimo"""
        low_stocks = Stock.objects.filter(
            total_quantity_kg__lt=F('minimum_quantity_kg')
        )
        serializer = self.get_serializer(low_stocks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Resumo geral de estoque"""
        total = Stock.objects.aggregate(
            total_quantity=Sum('total_quantity_kg'),
            total_reserved=Sum('reserved_quantity_kg')
        )
        return Response({
            'total_quantity_kg': total['total_quantity'] or 0,
            'reserved_quantity_kg': total['total_reserved'] or 0,
            'available_quantity_kg': (total['total_quantity'] or 0) - (total['total_reserved'] or 0)
        })


class BatchViewSet(viewsets.ModelViewSet):
    """CRUD de lotes"""
    queryset = Batch.objects.all()
    serializer_class = BatchSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['batch_number', 'supplier', 'origin']
    filterset_fields = ['status', 'quality_grade', 'stock__warehouse', 'stock__seed_type']
    ordering_fields = ['expiration_date', 'created_at', 'available_quantity_kg']
    
    @action(detail=False, methods=['get'])
    def by_priority(self, request):
        """Lista lotes ordenados por prioridade de vencimento (FIFO)"""
        batches = Batch.objects.filter(
            status='available',
            available_quantity_kg__gt=0
        ).order_by('expiration_date')
        
        serializer = BatchPrioritySerializer(batches, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        """Lista lotes próximos do vencimento (30 dias)"""
        threshold = date.today() + timedelta(days=30)
        batches = Batch.objects.filter(
            status='available',
            expiration_date__lte=threshold,
            available_quantity_kg__gt=0
        ).order_by('expiration_date')
        
        serializer = BatchPrioritySerializer(batches, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def expired(self, request):
        """Lista lotes vencidos"""
        batches = Batch.objects.filter(
            expiration_date__lt=date.today()
        ).order_by('expiration_date')
        
        # Atualizar status automaticamente
        batches.update(status='expired')
        
        serializer = BatchSerializer(batches, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search_in_warehouse(self, request):
        """Busca lotes em armazém específico"""
        warehouse_id = request.query_params.get('warehouse_id')
        seed_type_id = request.query_params.get('seed_type_id')
        min_quantity = request.query_params.get('min_quantity', 0)
        
        queryset = Batch.objects.filter(
            status='available',
            available_quantity_kg__gte=min_quantity
        )
        
        if warehouse_id:
            queryset = queryset.filter(stock__warehouse_id=warehouse_id)
        if seed_type_id:
            queryset = queryset.filter(stock__seed_type_id=seed_type_id)
        
        queryset = queryset.order_by('expiration_date')
        serializer = BatchPrioritySerializer(queryset, many=True)
        return Response(serializer.data)


class StockMovementViewSet(viewsets.ModelViewSet):
    """CRUD de movimentações de estoque"""
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['movement_type', 'batch', 'performed_by']
    ordering_fields = ['created_at']
    
    def perform_create(self, serializer):
        serializer.save(performed_by=self.request.user)


class SeedRequestViewSet(viewsets.ModelViewSet):
    """CRUD de solicitações de sementes"""
    queryset = SeedRequest.objects.all()
    serializer_class = SeedRequestSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['request_number', 'delivery_city']
    filterset_fields = ['status', 'priority', 'seed_type', 'requester']
    ordering_fields = ['created_at', 'requested_date', 'priority']
    
    def perform_create(self, serializer):
        # Gerar número de solicitação automaticamente
        import uuid
        request_number = f"SR-{uuid.uuid4().hex[:8].upper()}"
        serializer.save(
            requester=self.request.user,
            request_number=request_number
        )
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Aprovar solicitação"""
        seed_request = self.get_object()
        batch_id = request.data.get('batch_id')
        
        if seed_request.status != 'pending':
            return Response(
                {'error': 'Solicitação não está pendente'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        seed_request.status = 'approved'
        seed_request.approved_by = request.user
        seed_request.approved_date = date.today()
        
        if batch_id:
            try:
                batch = Batch.objects.get(id=batch_id)
                seed_request.assigned_batch = batch
            except Batch.DoesNotExist:
                pass
        
        seed_request.save()
        serializer = self.get_serializer(seed_request)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Rejeitar solicitação"""
        seed_request = self.get_object()
        reason = request.data.get('reason', '')
        
        seed_request.status = 'rejected'
        seed_request.notes = reason
        seed_request.save()
        
        serializer = self.get_serializer(seed_request)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_delivered(self, request, pk=None):
        """Marcar como entregue"""
        seed_request = self.get_object()
        
        seed_request.status = 'delivered'
        seed_request.delivered_date = date.today()
        seed_request.save()
        
        serializer = self.get_serializer(seed_request)
        return Response(serializer.data)
```

### geolocation/views.py

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import DeliveryPoint, DeliveryRoute, RouteStop
from .serializers import (
    DeliveryPointSerializer, DeliveryRouteSerializer,
    GeocodeRequestSerializer, ReverseGeocodeRequestSerializer,
    DistanceRequestSerializer, RouteRequestSerializer,
    NearbySearchRequestSerializer
)
from .services import GoogleMapsService


class DeliveryPointViewSet(viewsets.ModelViewSet):
    """CRUD de pontos de entrega"""
    queryset = DeliveryPoint.objects.all()
    serializer_class = DeliveryPointSerializer
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Lista pontos por tipo"""
        point_type = request.query_params.get('type')
        if point_type:
            points = DeliveryPoint.objects.filter(point_type=point_type, is_active=True)
        else:
            points = DeliveryPoint.objects.filter(is_active=True)
        serializer = self.get_serializer(points, many=True)
        return Response(serializer.data)


class DeliveryRouteViewSet(viewsets.ModelViewSet):
    """CRUD de rotas de entrega"""
    queryset = DeliveryRoute.objects.all()
    serializer_class = DeliveryRouteSerializer
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Iniciar rota"""
        from django.utils import timezone
        route = self.get_object()
        route.status = 'in_progress'
        route.started_at = timezone.now()
        route.save()
        serializer = self.get_serializer(route)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Finalizar rota"""
        from django.utils import timezone
        route = self.get_object()
        route.status = 'completed'
        route.completed_at = timezone.now()
        route.save()
        serializer = self.get_serializer(route)
        return Response(serializer.data)


# Google Maps API Views
class GeocodeView(APIView):
    """Geocodificação: endereço -> coordenadas"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = GeocodeRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        service = GoogleMapsService()
        result = service.geocode(serializer.validated_data['address'])
        
        if result:
            return Response(result)
        return Response(
            {'error': 'Endereço não encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )


class ReverseGeocodeView(APIView):
    """Geocodificação reversa: coordenadas -> endereço"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ReverseGeocodeRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        service = GoogleMapsService()
        result = service.reverse_geocode(
            serializer.validated_data['latitude'],
            serializer.validated_data['longitude']
        )
        
        if result:
            return Response(result)
        return Response(
            {'error': 'Endereço não encontrado para estas coordenadas'},
            status=status.HTTP_404_NOT_FOUND
        )


class DistanceView(APIView):
    """Calcular distância entre dois pontos"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = DistanceRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        service = GoogleMapsService()
        result = service.calculate_distance(
            origin=(data['origin_lat'], data['origin_lng']),
            destination=(data['destination_lat'], data['destination_lng']),
            mode=data['mode']
        )
        
        if result:
            return Response(result)
        return Response(
            {'error': 'Não foi possível calcular a distância'},
            status=status.HTTP_400_BAD_REQUEST
        )


class RouteView(APIView):
    """Calcular rota otimizada"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = RouteRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        waypoints = None
        if data.get('waypoints'):
            waypoints = [(wp['lat'], wp['lng']) for wp in data['waypoints']]
        
        service = GoogleMapsService()
        result = service.calculate_route(
            origin=(data['origin_lat'], data['origin_lng']),
            destination=(data['destination_lat'], data['destination_lng']),
            waypoints=waypoints,
            optimize=data['optimize']
        )
        
        if result:
            return Response(result)
        return Response(
            {'error': 'Não foi possível calcular a rota'},
            status=status.HTTP_400_BAD_REQUEST
        )


class NearbySearchView(APIView):
    """Buscar lugares próximos"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = NearbySearchRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        service = GoogleMapsService()
        results = service.search_nearby(
            location=(data['latitude'], data['longitude']),
            radius=data['radius'],
            place_type=data.get('place_type'),
            keyword=data.get('keyword')
        )
        
        return Response({'places': results})
```

---

## URLs

### agroipa_backend/urls.py

```python
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from seeds.views import (
    SeedTypeViewSet, WarehouseViewSet, StockViewSet,
    BatchViewSet, StockMovementViewSet, SeedRequestViewSet
)
from geolocation.views import (
    DeliveryPointViewSet, DeliveryRouteViewSet,
    GeocodeView, ReverseGeocodeView, DistanceView,
    RouteView, NearbySearchView
)

router = DefaultRouter()
# Seeds
router.register(r'seed-types', SeedTypeViewSet)
router.register(r'warehouses', WarehouseViewSet)
router.register(r'stocks', StockViewSet)
router.register(r'batches', BatchViewSet)
router.register(r'stock-movements', StockMovementViewSet)
router.register(r'seed-requests', SeedRequestViewSet)
# Geolocation
router.register(r'delivery-points', DeliveryPointViewSet)
router.register(r'delivery-routes', DeliveryRouteViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API
    path('api/v1/', include(router.urls)),
    
    # Auth JWT
    path('api/v1/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Google Maps endpoints
    path('api/v1/geo/geocode/', GeocodeView.as_view(), name='geocode'),
    path('api/v1/geo/reverse-geocode/', ReverseGeocodeView.as_view(), name='reverse_geocode'),
    path('api/v1/geo/distance/', DistanceView.as_view(), name='distance'),
    path('api/v1/geo/route/', RouteView.as_view(), name='route'),
    path('api/v1/geo/nearby/', NearbySearchView.as_view(), name='nearby_search'),
    
    # Swagger/OpenAPI
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
```

---

## Resumo dos Endpoints da API

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/auth/login/` | Login (retorna JWT) |
| POST | `/api/v1/auth/refresh/` | Renovar token |

### Tipos de Sementes
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/seed-types/` | Listar tipos |
| POST | `/api/v1/seed-types/` | Criar tipo |
| GET | `/api/v1/seed-types/{id}/` | Detalhe |
| PUT | `/api/v1/seed-types/{id}/` | Atualizar |
| DELETE | `/api/v1/seed-types/{id}/` | Excluir |

### Armazéns
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/warehouses/` | Listar armazéns |
| GET | `/api/v1/warehouses/{id}/stocks/` | Estoques do armazém |
| GET | `/api/v1/warehouses/{id}/batches/` | Lotes do armazém |

### Estoques
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/stocks/` | Listar estoques |
| GET | `/api/v1/stocks/low_stock/` | Estoques baixos |
| GET | `/api/v1/stocks/summary/` | Resumo geral |

### Lotes (Batches)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/batches/` | Listar lotes |
| GET | `/api/v1/batches/by_priority/` | Por prioridade (vencimento) |
| GET | `/api/v1/batches/expiring_soon/` | Próximos a vencer |
| GET | `/api/v1/batches/expired/` | Vencidos |
| GET | `/api/v1/batches/search_in_warehouse/` | Buscar em armazém |

### Solicitações de Sementes
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/seed-requests/` | Listar solicitações |
| POST | `/api/v1/seed-requests/` | Criar solicitação |
| POST | `/api/v1/seed-requests/{id}/approve/` | Aprovar |
| POST | `/api/v1/seed-requests/{id}/reject/` | Rejeitar |
| POST | `/api/v1/seed-requests/{id}/mark_delivered/` | Marcar entregue |

### Geolocalização (Google Maps)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/geo/geocode/` | Endereço → Coordenadas |
| POST | `/api/v1/geo/reverse-geocode/` | Coordenadas → Endereço |
| POST | `/api/v1/geo/distance/` | Calcular distância |
| POST | `/api/v1/geo/route/` | Calcular rota otimizada |
| POST | `/api/v1/geo/nearby/` | Buscar lugares próximos |

### Pontos de Entrega
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/delivery-points/` | Listar pontos |
| GET | `/api/v1/delivery-points/by_type/` | Por tipo |

### Rotas de Entrega
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/delivery-routes/` | Listar rotas |
| POST | `/api/v1/delivery-routes/{id}/start/` | Iniciar rota |
| POST | `/api/v1/delivery-routes/{id}/complete/` | Finalizar rota |

---

## Integração com o Frontend React

### Configuração do Axios (src/lib/api.ts)

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para renovar token expirado
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', data.access);
          error.config.headers.Authorization = `Bearer ${data.access}`;
          return axios(error.config);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

---

## Comandos de Execução

```bash
# Criar migrações
python manage.py makemigrations

# Aplicar migrações
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Rodar servidor de desenvolvimento
python manage.py runserver

# Rodar em produção (gunicorn)
gunicorn agroipa_backend.wsgi:application --bind 0.0.0.0:8000
```

---

## Próximos Passos

1. **Criar o projeto Django** localmente seguindo esta documentação
2. **Configurar MySQL Workbench** e criar o banco de dados `agroipa`
3. **Obter chave do Google Maps** em [Google Cloud Console](https://console.cloud.google.com/)
4. **Configurar variáveis de ambiente** no arquivo `.env`
5. **Rodar migrações** para criar as tabelas
6. **Testar endpoints** via Swagger em `/api/docs/`
7. **Integrar frontend** React usando a configuração do Axios fornecida
