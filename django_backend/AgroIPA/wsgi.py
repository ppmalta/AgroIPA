"""
WSGI config for agroipa project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agroipa.settings')
application = get_wsgi_application()