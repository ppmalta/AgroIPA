"""
AgroIPA - Models de Logística (Expedições, Entregas, Solicitações)
"""

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class Farmer(models.Model):
    """Agricultores beneficiários"""

    name = models.CharField(max_length=200, verbose_name='Nome')
    cpf = models.CharField(max_length=14, unique=True)
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True, verbose_name='Endereço')
    municipality = models.ForeignKey(
        'inventory.Municipality',
        on_delete=models.PROTECT,
        related_name='farmers'
    )
    dap_number = models.CharField(max_length=50, blank=True, verbose_name='Nº DAP/CAF')
    organization = models.ForeignKey(
        'users.Organization',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='farmers',
        verbose_name='Organização'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Agricultor'
        verbose_name_plural = 'Agricultores'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.cpf})"


class SeedRequest(models.Model):
    """Solicitações de sementes por organizações/agricultores"""

    class Status(models.TextChoices):
        PENDENTE = 'pendente', 'Pendente'
        ANALISE = 'analise', 'Em Análise'
        APROVADA = 'aprovada', 'Aprovada'
        PARCIAL = 'parcial', 'Parcialmente Aprovada'
        REJEITADA = 'rejeitada', 'Rejeitada'
        ATENDIDA = 'atendida', 'Atendida'
        CANCELADA = 'cancelada', 'Cancelada'

    request_number = models.CharField(max_length=50, unique=True, verbose_name='Nº Solicitação')

    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='seed_requests',
        verbose_name='Solicitante'
    )
    organization = models.ForeignKey(
        'users.Organization',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='seed_requests',
        verbose_name='Organização'
    )

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDENTE)

    justification = models.TextField(verbose_name='Justificativa')
    beneficiaries_count = models.PositiveIntegerField(
        verbose_name='Nº de Beneficiários',
        validators=[MinValueValidator(1)]
    )

    priority = models.PositiveSmallIntegerField(default=0, verbose_name='Prioridade')

    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='requests_reviewed',
        verbose_name='Avaliador'
    )
    review_notes = models.TextField(blank=True, verbose_name='Parecer')
    reviewed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Solicitação'
        verbose_name_plural = 'Solicitações'
        ordering = ['-priority', '-created_at']

    def __str__(self):
        return f"{self.request_number} - {self.organization or self.requester}"


class SeedRequestItem(models.Model):
    """Itens de uma solicitação (espécie + quantidade)"""

    request = models.ForeignKey(
        SeedRequest,
        on_delete=models.CASCADE,
        related_name='items'
    )
    species = models.ForeignKey(
        'inventory.Species',
        on_delete=models.PROTECT,
        related_name='request_items'
    )
    quantity_requested = models.DecimalField(
        max_digits=12, decimal_places=2,
        validators=[MinValueValidator(0.01)],
        verbose_name='Quantidade Solicitada (kg)'
    )
    quantity_approved = models.DecimalField(
        max_digits=12, decimal_places=2,
        null=True, blank=True,
        verbose_name='Quantidade Aprovada (kg)'
    )

    class Meta:
        verbose_name = 'Item de Solicitação'
        verbose_name_plural = 'Itens de Solicitação'
        unique_together = ['request', 'species']

    def __str__(self):
        return f"{self.species.name}: {self.quantity_requested}kg"


class Expedition(models.Model):
    """Ordens de expedição para municípios"""

    class Status(models.TextChoices):
        PENDENTE = 'pendente', 'Pendente'
        PREPARANDO = 'preparando', 'Em Preparação'
        TRANSITO = 'transito', 'Em Trânsito'
        ENTREGUE = 'entregue', 'Entregue'
        CANCELADA = 'cancelada', 'Cancelada'

    expedition_number = models.CharField(max_length=50, unique=True, verbose_name='Nº Expedição')

    warehouse_origin = models.ForeignKey(
        'inventory.Warehouse',
        on_delete=models.PROTECT,
        related_name='expeditions',
        verbose_name='Armazém Origem'
    )
    destination = models.ForeignKey(
        'inventory.Municipality',
        on_delete=models.PROTECT,
        related_name='expeditions',
        verbose_name='Município Destino'
    )

    seed_request = models.ForeignKey(
        SeedRequest,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='expeditions',
        verbose_name='Solicitação'
    )

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDENTE)

    scheduled_date = models.DateField(verbose_name='Data Prevista')
    shipped_at = models.DateTimeField(null=True, blank=True, verbose_name='Data de Saída')
    delivered_at = models.DateTimeField(null=True, blank=True, verbose_name='Data de Entrega')

    vehicle_plate = models.CharField(max_length=10, blank=True, verbose_name='Placa do Veículo')
    driver_name = models.CharField(max_length=100, blank=True, verbose_name='Motorista')

    delivery_proof = models.ImageField(
        upload_to='delivery_proofs/',
        blank=True,
        verbose_name='Comprovante de Entrega'
    )

    notes = models.TextField(blank=True, verbose_name='Observações')

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='expeditions_created'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Expedição'
        verbose_name_plural = 'Expedições'
        ordering = ['-scheduled_date']

    def __str__(self):
        return f"{self.expedition_number} - {self.destination.name}"

    @property
    def total_quantity(self):
        return sum(item.quantity for item in self.items.all())


class ExpeditionItem(models.Model):
    """Itens de uma expedição (lote + quantidade)"""

    expedition = models.ForeignKey(
        Expedition,
        on_delete=models.CASCADE,
        related_name='items'
    )
    lot = models.ForeignKey(
        'inventory.Lot',
        on_delete=models.PROTECT,
        related_name='expedition_items'
    )
    quantity = models.DecimalField(
        max_digits=12, decimal_places=2,
        validators=[MinValueValidator(0.01)],
        verbose_name='Quantidade (kg)'
    )

    class Meta:
        verbose_name = 'Item de Expedição'
        verbose_name_plural = 'Itens de Expedição'
        unique_together = ['expedition', 'lot']

    def __str__(self):
        return f"{self.lot.lot_number}: {self.quantity}kg"


class Delivery(models.Model):
    """Registro de entrega para agricultor"""

    expedition = models.ForeignKey(
        Expedition,
        on_delete=models.CASCADE,
        related_name='deliveries'
    )
    lot = models.ForeignKey(
        'inventory.Lot',
        on_delete=models.PROTECT,
        related_name='deliveries'
    )
    farmer = models.ForeignKey(
        Farmer,
        on_delete=models.PROTECT,
        related_name='deliveries'
    )

    quantity = models.DecimalField(
        max_digits=12, decimal_places=2,
        validators=[MinValueValidator(0.01)],
        verbose_name='Quantidade (kg)'
    )

    delivered_at = models.DateTimeField(verbose_name='Data/Hora da Entrega')
    delivered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='deliveries_made',
        verbose_name='Entregue por'
    )

    signature = models.ImageField(
        upload_to='signatures/',
        blank=True,
        verbose_name='Assinatura'
    )
    proof_photo = models.ImageField(
        upload_to='delivery_photos/',
        blank=True,
        verbose_name='Foto do Comprovante'
    )

    notes = models.TextField(blank=True, verbose_name='Observações')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Entrega'
        verbose_name_plural = 'Entregas'
        ordering = ['-delivered_at']

    def __str__(self):
        return f"{self.lot.lot_number} → {self.farmer.name}: {self.quantity}kg"
