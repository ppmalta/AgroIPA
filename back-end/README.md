# agroIPA_backend

Estrutura backend Django + Django REST Framework para integração com seu frontend via APIs REST.

## Recursos
- Projeto Django `agro_backend`
- Aplicativo `core` com modelos: Município, Fazenda, Campo, Colheita, Dados do Sensor
- DRF ViewSets + Routers para endpoints CRUD padrão
- Autenticação JWT (Simple JWT) configurada
- Exemplos de fixtures e instruções de migração

## Requisitos
- Python 3.8+
- pip
- Pacotes recomendados:
  - django
  - djangorestframework
  - djangorestframework-simplejwt
  - django-cors-headers (se o frontend for hospedado separadamente)

Instalar:
```bash
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers
```

## Início rápido
```bash
cd agroIPA_backend
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

root API padrão: `http://127.0.0.1:8000/api/`

## Notes
- Ajuste CORS e hosts permitidos em `agro_backend/settings.py`