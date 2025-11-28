"""
AgroIPA - Models de Usuários e Perfis
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator


class User(AbstractUser):
    """Usuário customizado do sistema"""

    email = models.EmailField(unique=True)
    phone = models.CharField(
        max_length=15,
        blank=True,
        validators=[RegexValidator(r'^\(\d{2}\)\s?\d{4,5}-?\d{4}$')]
    )
    cpf = models.CharField(max_length=14, blank=True, unique=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
        ordering = ['-created_at']

    def __str__(self):
        return self.get_full_name() or self.email


class Role(models.Model):
    """Perfis/Papéis de usuário (separado por segurança)"""

    class RoleType(models.TextChoices):
        GESTOR = 'gestor', 'Gestor (Admin)'
        OPERADOR = 'operador', 'Operador de Armazém'
        AGENTE = 'agente', 'Agente de Distribuição'
        SOLICITANTE = 'solicitante', 'Solicitante'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='roles')
    role = models.CharField(max_length=20, choices=RoleType.choices)
    granted_at = models.DateTimeField(auto_now_add=True)
    granted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='roles_granted'
    )

    class Meta:
        verbose_name = 'Perfil de Usuário'
        verbose_name_plural = 'Perfis de Usuários'
        unique_together = ['user', 'role']

    def __str__(self):
        return f"{self.user.email} - {self.get_role_display()}"


class Organization(models.Model):
    """Organizações solicitantes (cooperativas, associações, ONGs)"""

    class OrgType(models.TextChoices):
        COOPERATIVA = 'cooperativa', 'Cooperativa'
        ASSOCIACAO = 'associacao', 'Associação'
        ONG = 'ong', 'ONG'
        EMPREENDEDOR = 'empreendedor', 'Empreendedor Familiar Rural'

    name = models.CharField(max_length=200, verbose_name='Nome')
    org_type = models.CharField(max_length=20, choices=OrgType.choices, verbose_name='Tipo')
    cnpj = models.CharField(max_length=18, unique=True, blank=True, null=True)
    address = models.TextField(verbose_name='Endereço', blank=True)
    municipality = models.ForeignKey(
        'inventory.Municipality',
        on_delete=models.PROTECT,
        related_name='organizations',
        null=True
    )
    contact_name = models.CharField(max_length=100, verbose_name='Contato', blank=True)
    contact_phone = models.CharField(max_length=15, blank=True)
    contact_email = models.EmailField(blank=True)
    representative = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='organizations'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Organização'
        verbose_name_plural = 'Organizações'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.get_org_type_display()})"
