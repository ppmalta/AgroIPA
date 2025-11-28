"""
AgroIPA - Serializers de Usuários
"""

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Role, Organization


class RoleSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = Role
        fields = ['id', 'role', 'role_display', 'granted_at']
        read_only_fields = ['granted_at']


class UserSerializer(serializers.ModelSerializer):
    roles = RoleSerializer(many=True, read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'full_name', 'phone', 'cpf', 'roles', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_full_name(self, obj):
        return obj.get_full_name()


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'username', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone', 'cpf'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password': 'As senhas não conferem.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


class OrganizationSerializer(serializers.ModelSerializer):
    org_type_display = serializers.CharField(source='get_org_type_display', read_only=True)
    municipality_name = serializers.CharField(source='municipality.name', read_only=True)
    representative_name = serializers.CharField(source='representative.get_full_name', read_only=True)

    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'org_type', 'org_type_display', 'cnpj',
            'address', 'municipality', 'municipality_name',
            'contact_name', 'contact_phone', 'contact_email',
            'representative', 'representative_name', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Senha atual incorreta.')
        return value
