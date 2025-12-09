from django.db import models
from django.conf import settings

class SeedType(models.Model):
    name = models.CharField(max_length=100)
    scientific_name = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50)
    germination_time_days = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'seed_types'

    def __str__(self):
        return self.name


class Warehouse(models.Model):
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


class Batch(models.Model):
    batch_number = models.CharField(max_length=50, unique=True)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='batches')
    quantity_kg = models.DecimalField(max_digits=12, decimal_places=2)
    available_quantity_kg = models.DecimalField(max_digits=12, decimal_places=2)
    production_date = models.DateField()
    expiration_date = models.DateField()
    quality_grade = models.CharField(max_length=1)
    germination_rate = models.DecimalField(max_digits=5, decimal_places=2)
    supplier = models.CharField(max_length=200)
    origin = models.CharField(max_length=100)
    status = models.CharField(max_length=20, default='available')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'batches'

    def __str__(self):
        return f"Lote {self.batch_number}"


class StockMovement(models.Model):
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
    destination_warehouse = models.ForeignKey(Warehouse, on_delete=models.SET_NULL, null=True, blank=True, related_name='incoming_movements')
    reason = models.TextField(blank=True)
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'stock_movements'


class SeedRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('approved', 'Aprovado'),
        ('rejected', 'Rejeitado'),
        ('in_progress', 'Em Andamento'),
        ('delivered', 'Entregue'),
        ('cancelled', 'Cancelado'),
    ]
    request_number = models.CharField(max_length=50, unique=True)
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='seed_requests')
    seed_type = models.ForeignKey(SeedType, on_delete=models.CASCADE)
    quantity_kg = models.DecimalField(max_digits=12, decimal_places=2)
    priority = models.CharField(max_length=10, default='medium')
    status = models.CharField(max_length=20, default='pending')
    delivery_address = models.TextField()
    delivery_city = models.CharField(max_length=100)
    delivery_state = models.CharField(max_length=50)
    delivery_latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    delivery_longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    requested_date = models.DateField()
    approved_date = models.DateField(null=True, blank=True)
    delivered_date = models.DateField(null=True, blank=True)
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_requests')
    assigned_batch = models.ForeignKey(Batch, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'seed_requests'
