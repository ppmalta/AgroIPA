"""
AgroIPA - Views de Usuários
"""

from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import User, Role, Organization
from .serializers import (
    UserSerializer, UserCreateSerializer, RoleSerializer,
    OrganizationSerializer, ChangePasswordSerializer
)
from .permissions import IsGestor, IsGestorOrReadOnly


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciamento de usuários"""

    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsGestorOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active']
    search_fields = ['email', 'first_name', 'last_name', 'cpf']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Retorna dados do usuário logado"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Altera senha do usuário logado"""
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            return Response({'message': 'Senha alterada com sucesso.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsGestor])
    def assign_role(self, request, pk=None):
        """Atribui um perfil ao usuário"""
        user = self.get_object()
        role = request.data.get('role')

        if role not in dict(Role.RoleType.choices):
            return Response(
                {'error': 'Perfil inválido.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        role_obj, created = Role.objects.get_or_create(
            user=user,
            role=role,
            defaults={'granted_by': request.user}
        )

        if not created:
            return Response(
                {'message': 'Usuário já possui este perfil.'},
                status=status.HTTP_200_OK
            )

        return Response(
            {'message': f'Perfil {role} atribuído com sucesso.'},
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['delete'], permission_classes=[IsGestor])
    def remove_role(self, request, pk=None):
        """Remove um perfil do usuário"""
        user = self.get_object()
        role = request.data.get('role')

        try:
            role_obj = Role.objects.get(user=user, role=role)
            role_obj.delete()
            return Response({'message': 'Perfil removido com sucesso.'})
        except Role.DoesNotExist:
            return Response(
                {'error': 'Usuário não possui este perfil.'},
                status=status.HTTP_404_NOT_FOUND
            )


class OrganizationViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciamento de organizações"""

    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['org_type', 'municipality', 'is_active']
    search_fields = ['name', 'cnpj', 'contact_name']

    def get_queryset(self):
        user = self.request.user
        # Gestores veem todas as organizações
        if user.roles.filter(role='gestor').exists():
            return Organization.objects.all()
        # Solicitantes veem apenas suas organizações
        return Organization.objects.filter(representative=user)


class RegisterView(generics.CreateAPIView):
    """View pública para registro de novos usuários"""

    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        # Atribui perfil de solicitante por padrão
        Role.objects.create(user=user, role=Role.RoleType.SOLICITANTE)
