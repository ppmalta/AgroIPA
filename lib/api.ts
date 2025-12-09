import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para refresh automático do token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Types
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DeliveryPoint {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  point_type: 'warehouse' | 'distribution_center' | 'delivery_point';
  contact_name?: string;
  contact_phone?: string;
  is_active: boolean;
}

export interface DeliveryRoute {
  id: number;
  name: string;
  origin: DeliveryPoint;
  destination: DeliveryPoint;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  distance_km?: number;
  estimated_duration_minutes?: number;
  started_at?: string;
  completed_at?: string;
  stops: RouteStop[];
}

export interface RouteStop {
  id: number;
  delivery_point: DeliveryPoint;
  order: number;
  arrived_at?: string;
  departed_at?: string;
}

export interface Agent {
  id: number;
  name: string;
  phone: string;
  current_latitude?: number;
  current_longitude?: number;
  is_active: boolean;
  current_route?: DeliveryRoute;
}

// Seed Types
export interface SeedType {
  id: number;
  name: string;
  scientific_name?: string;
  description?: string;
  planting_season?: string;
  is_active: boolean;
}

export interface SeedRequest {
  id: number;
  request_number: string;
  seed_type: SeedType;
  variety: string;
  quantity_kg: number;
  requester_name: string;
  requester_organization?: string;
  destination_address: string;
  destination_latitude?: number;
  destination_longitude?: number;
  needed_by_date: string;
  justification?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'delivered';
  created_at: string;
  updated_at: string;
}

export interface CreateSeedRequestData {
  seed_type_id: number;
  variety: string;
  quantity_kg: number;
  requester_name: string;
  requester_organization?: string;
  destination_address: string;
  destination_latitude?: number;
  destination_longitude?: number;
  needed_by_date: string;
  justification?: string;
}

// API Functions
export const deliveryApi = {
  getPoints: async (params?: { point_type?: string; is_active?: boolean }) => {
    const response = await api.get<DeliveryPoint[]>('/delivery-points/', { params });
    return response.data;
  },
  
  getPointById: async (id: number) => {
    const response = await api.get<DeliveryPoint>(`/delivery-points/${id}/`);
    return response.data;
  },
  
  getRoutes: async (params?: { status?: string }) => {
    const response = await api.get<DeliveryRoute[]>('/delivery-routes/', { params });
    return response.data;
  },
  
  getRouteById: async (id: number) => {
    const response = await api.get<DeliveryRoute>(`/delivery-routes/${id}/`);
    return response.data;
  },
  
  startRoute: async (id: number) => {
    const response = await api.post<DeliveryRoute>(`/delivery-routes/${id}/start/`);
    return response.data;
  },
  
  completeRoute: async (id: number) => {
    const response = await api.post<DeliveryRoute>(`/delivery-routes/${id}/complete/`);
    return response.data;
  },
};

export const agentApi = {
  getAgents: async (params?: { is_active?: boolean }) => {
    const response = await api.get<Agent[]>('/agents/', { params });
    return response.data;
  },
  
  getAgentById: async (id: number) => {
    const response = await api.get<Agent>(`/agents/${id}/`);
    return response.data;
  },
  
  updateLocation: async (id: number, latitude: number, longitude: number) => {
    const response = await api.patch<Agent>(`/agents/${id}/`, {
      current_latitude: latitude,
      current_longitude: longitude,
    });
    return response.data;
  },
};

export const geocodingApi = {
  geocode: async (address: string) => {
    const response = await api.post<Coordinates>('/geocode/', { address });
    return response.data;
  },
  
  reverseGeocode: async (latitude: number, longitude: number) => {
    const response = await api.post<{ address: string }>('/reverse-geocode/', {
      latitude,
      longitude,
    });
    return response.data;
  },
  
  calculateRoute: async (origin: Coordinates, destination: Coordinates, waypoints?: Coordinates[]) => {
    const response = await api.post('/route/', { origin, destination, waypoints });
    return response.data;
  },
};

// Seed Requests API
export const seedRequestApi = {
  getAll: async (params?: { status?: string }) => {
    const response = await api.get<SeedRequest[]>('/seed-requests/', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<SeedRequest>(`/seed-requests/${id}/`);
    return response.data;
  },

  create: async (data: CreateSeedRequestData) => {
    const response = await api.post<SeedRequest>('/seed-requests/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateSeedRequestData>) => {
    const response = await api.patch<SeedRequest>(`/seed-requests/${id}/`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/seed-requests/${id}/`);
  },

  approve: async (id: number) => {
    const response = await api.post<SeedRequest>(`/seed-requests/${id}/approve/`);
    return response.data;
  },

  reject: async (id: number, reason?: string) => {
    const response = await api.post<SeedRequest>(`/seed-requests/${id}/reject/`, { reason });
    return response.data;
  },

  markDelivered: async (id: number) => {
    const response = await api.post<SeedRequest>(`/seed-requests/${id}/mark_delivered/`);
    return response.data;
  },
};

// Seed Types API
export const seedTypeApi = {
  getAll: async () => {
    const response = await api.get<SeedType[]>('/seed-types/');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<SeedType>(`/seed-types/${id}/`);
    return response.data;
  },
};
