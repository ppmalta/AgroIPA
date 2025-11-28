"""
AgroIPA - Permissões customizadas
"""

from rest_framework import permissions


class IsGestor(permissions.BasePermission):
    """Permite acesso apenas para Gestores (Admin)"""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.roles.filter(role='gestor').exists()


class IsGestorOrReadOnly(permissions.BasePermission):
    """Gestores podem tudo, outros apenas leitura"""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not request.user.is_authenticated:
            return False
        return request.user.roles.filter(role='gestor').exists()


class IsOperador(permissions.BasePermission):
    """Permite acesso para Operadores de Armazém"""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.roles.filter(role__in=['gestor', 'operador']).exists()


class IsAgente(permissions.BasePermission):
    """Permite acesso para Agentes de Distribuição"""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.roles.filter(role__in=['gestor', 'agente']).exists()


class IsSolicitante(permissions.BasePermission):
    """Permite acesso para Solicitantes"""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.roles.filter(role='solicitante').exists()


class IsOwnerOrGestor(permissions.BasePermission):
    """Permite acesso ao proprietário do objeto ou gestores"""

    def has_object_permission(self, request, view, obj):
        if request.user.roles.filter(role='gestor').exists():
            return True
        # Verifica se o objeto tem campo 'user' ou 'created_by'
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        if hasattr(obj, 'representative'):
            return obj.representative == request.user
        return False
