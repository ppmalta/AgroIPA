"""
AgroIPA - Models de Inventário (Lotes, Estoque, Armazéns)
"""

import uuid
import qrcode
from io import BytesIO
from django.db import models
from django.core.files.base import ContentFile
from django.core.validators import MinValueValidator
from django.conf import settings


class Species(models.Model):
    """Espécies de sementes (milho, feijão, etc.)"""

    name = models.CharField(max_length=100, unique=True, verbose_name='Nome')
    scientific_name = models.CharField(max_length=200, blank=True, verbose_name='Nome Científico')
    description = models.TextField(blank=True, verbose_name='Descrição')
    unit = models.CharField(max_length=20, default='kg', verbose_name='Unidade')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Espécie'
        verbose_name_plural = 'Espécies'
        ordering = ['name']

    def __str__(self):
        return self.name


class Supplier(models.Model):
    """Fornecedores de sementes"""

    name = models.CharField(max_length=200, verbose_name='Nome')
    cnpj = models.CharField(max_length=18, unique=True, blank=True, null=True)
    address = models.TextField(blank=True, verbose_name='Endereço')
    phone = models.CharField(max_length=15, blank=True)
    email = models.EmailField(blank=True)
    contact_name = models.CharField(max_length=100, blank=True, verbose_name='Contato')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Fornecedor'
        verbose_name_plural = 'Fornecedores'
        ordering = ['name']

    def __str__(self):
        return self.name


class Municipality(models.Model):
    """Municípios atendidos pelo programa"""

    name = models.CharField(max_length=100, verbose_name='Nome')
    code_ibge = models.CharField(max_length=7, unique=True, verbose_name='Código IBGE')
    state = models.CharField(max_length=2, default='PE', verbose_name='UF')
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Município'
        verbose_name_plural = 'Municípios'
        ordering = ['name']

    def __str__(self):
        return f"{self.name}/{self.state}"


class Warehouse(models.Model):
    """Armazéns de estoque"""

    name = models.CharField(max_length=100, verbose_name='Nome')
    code = models.CharField(max_length=20, unique=True, verbose_name='Código')
    address = models.TextField(verbose_name='Endereço')
    municipality = models.ForeignKey(
        Municipality,
        on_delete=models.PROTECT,
        related_name='warehouses'
    )
    capacity = models.DecimalField(
        max_digits=12, decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name='Capacidade (kg)'
    )
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='managed_warehouses',
        verbose_name='Responsável'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Armazém'
        verbose_name_plural = 'Armazéns'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"

    @property
    def current_stock(self):
        """Retorna o estoque atual do armazém"""
        from django.db.models import Sum
        return self.stock_items.aggregate(
            total=Sum('quantity')
        )['total'] or 0


class Lot(models.Model):
    """Lotes de sementes"""

    class Status(models.TextChoices):
        ATIVO = 'ativo', 'Ativo'
        BAIXO = 'baixo', 'Estoque Baixo'
        ESGOTADO = 'esgotado', 'Esgotado'
        VENCIDO = 'vencido', 'Vencido'
        BLOQUEADO = 'bloqueado', 'Bloqueado'

    lot_number = models.CharField(max_length=50, unique=True, verbose_name='Número do Lote')
    species = models.ForeignKey(Species, on_delete=models.PROTECT, related_name='lots')
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT, related_name='lots')

    initial_quantity = models.DecimalField(
        max_digits=12, decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name='Quantidade Inicial (kg)'
    )

    manufacture_date = models.DateField(verbose_name='Data de Fabricação')
    expiry_date = models.DateField(verbose_name='Data de Validade')

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ATIVO)

    qr_code = models.ImageField(upload_to='qrcodes/', blank=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    notes = models.TextField(blank=True, verbose_name='Observações')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='lots_created'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Lote'
        verbose_name_plural = 'Lotes'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.lot_number} - {self.species.name}"

    def save(self, *args, **kwargs):
        # Gera QR Code se não existir
        if not self.qr_code:
            self.generate_qr_code()
        super().save(*args, **kwargs)

    def generate_qr_code(self):
        """Gera QR Code com UUID do lote"""
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(f"https://agroipa.gov.br/rastrear/{self.uuid}")
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')

        filename = f'qr_{self.lot_number}.png'
        self.qr_code.save(filename, ContentFile(buffer.getvalue()), save=False)

    @property
    def current_quantity(self):
        """Retorna a quantidade atual em estoque"""
        from django.db.models import Sum
        return self.stock_items.aggregate(
            total=Sum('quantity')
        )['total'] or 0


class Stock(models.Model):
    """Estoque por armazém e lote"""

    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name='stock_items'
    )
    lot = models.ForeignKey(
        Lot,
        on_delete=models.CASCADE,
        related_name='stock_items'
    )
    quantity = models.DecimalField(
        max_digits=12, decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name='Quantidade (kg)'
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Estoque'
        verbose_name_plural = 'Estoques'
        unique_together = ['warehouse', 'lot']

    def __str__(self):
        return f"{self.lot.lot_number} em {self.warehouse.name}: {self.quantity}kg"


class StockMovement(models.Model):
    """Movimentações de estoque (entrada/saída/transferência)"""

    class MovementType(models.TextChoices):
        ENTRADA = 'entrada', 'Entrada'
        SAIDA = 'saida', 'Saída'
        TRANSFERENCIA = 'transferencia', 'Transferência'
        AJUSTE = 'ajuste', 'Ajuste de Inventário'

    lot = models.ForeignKey(Lot, on_delete=models.CASCADE, related_name='movements')
    movement_type = models.CharField(max_length=20, choices=MovementType.choices)

    warehouse_origin = models.ForeignKey(
        Warehouse,
        on_delete=models.PROTECT,
        related_name='movements_out',
        null=True, blank=True,
        verbose_name='Armazém Origem'
    )
    warehouse_destination = models.ForeignKey(
        Warehouse,
        on_delete=models.PROTECT,
        related_name='movements_in',
        null=True, blank=True,
        verbose_name='Armazém Destino'
    )

    quantity = models.DecimalField(
        max_digits=12, decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name='Quantidade (kg)'
    )

    reference = models.CharField(max_length=100, blank=True, verbose_name='Referência')
    notes = models.TextField(blank=True, verbose_name='Observações')

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='movements_created'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Movimentação'
        verbose_name_plural = 'Movimentações'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_movement_type_display()} - {self.lot.lot_number}: {self.quantity}kg"
