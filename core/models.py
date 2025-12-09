from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
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
