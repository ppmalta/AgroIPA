from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Role, Organization


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'first_name', 'last_name', 'is_active', 'created_at']
    list_filter = ['is_active', 'is_staff', 'roles__role']
    search_fields = ['email', 'username', 'first_name', 'last_name', 'cpf']
    ordering = ['-created_at']

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Informações Adicionais', {'fields': ('phone', 'cpf')}),
    )


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'granted_at', 'granted_by']
    list_filter = ['role']
    search_fields = ['user__email', 'user__username']


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'org_type', 'municipality', 'is_active']
    list_filter = ['org_type', 'is_active']
    search_fields = ['name', 'cnpj']