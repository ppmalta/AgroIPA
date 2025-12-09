import { useCallback, useState, useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer } from "@react-google-maps/api";
import { Loader2 } from "lucide-react";

const GOOGLE_MAPS_API_KEY = "AIzaSyCioUcL8FZvxlTI1bxtDVAtIQ5xGXT6btU";

// Centro em Pernambuco, Brasil
const defaultCenter = {
  lat: -8.0476,
  lng: -34.8770,
};

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.75rem",
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "water",
      elementType: "geometry.fill",
      stylers: [{ color: "#a3ccff" }],
    },
    {
      featureType: "landscape",
      elementType: "geometry.fill",
      stylers: [{ color: "#f0f4f0" }],
    },
  ],
};

interface DeliveryLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  status: "pending" | "in_transit" | "delivered";
  agent?: string;
  eta?: string;
}

interface AgentLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  isActive: boolean;
}

interface DeliveryMapProps {
  deliveries?: DeliveryLocation[];
  agents?: AgentLocation[];
  showRoutes?: boolean;
  showHeatmap?: boolean;
  className?: string;
}

// Mock data para demonstração
const mockDeliveries: DeliveryLocation[] = [
  {
    id: "1",
    name: "Brooklyn Seed Co.",
    address: "123 Rua Surubim, Capibaribe, São Lourenço da Mata - PE",
    lat: -7.9987,
    lng: -35.0312,
    status: "pending",
    eta: "45 minutos",
  },
  {
    id: "2",
    name: "Manhattan Farm Supply",
    address: "456 Rua do Sossego, Gravatá Centro, Gravatá - PE",
    lat: -8.2006,
    lng: -35.5622,
    status: "in_transit",
    agent: "Sarah Chen",
    eta: "35 minutos",
  },
  {
    id: "3",
    name: "Centro Agrícola de Queens",
    address: "789 Rua Pantera Emília, Vitória de Santo Antão - PE",
    lat: -8.1178,
    lng: -35.2916,
    status: "in_transit",
    agent: "Mike Johnson",
    eta: "55 minutos",
  },
];

const mockAgents: AgentLocation[] = [
  { id: "1", name: "Mike Johnson", lat: -8.0576, lng: -34.9270, isActive: true },
  { id: "2", name: "Sarah Chen", lat: -8.1200, lng: -35.1500, isActive: true },
  { id: "3", name: "Carlos Rodriguez", lat: -8.0200, lng: -34.9100, isActive: true },
];

const getMarkerIcon = (status: DeliveryLocation["status"]) => {
  const colors = {
    pending: "#f59e0b", // amber
    in_transit: "#3b82f6", // blue
    delivered: "#22c55e", // green
  };
  
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: colors[status],
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
    scale: 10,
  };
};

const agentMarkerIcon = {
  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  fillColor: "#10b981",
  fillOpacity: 1,
  strokeColor: "#ffffff",
  strokeWeight: 2,
  scale: 1.5,
  anchor: new google.maps.Point(12, 24),
};

export const DeliveryMap = ({
  deliveries = mockDeliveries,
  agents = mockAgents,
  showRoutes = true,
  className = "",
}: DeliveryMapProps) => {
const [selectedDelivery, setSelectedDelivery] = useState<DeliveryLocation | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentLocation | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places", "geometry"],
  });

const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // Ajustar bounds para mostrar todos os marcadores
    if (deliveries.length > 0 || agents.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      deliveries.forEach((d) => bounds.extend({ lat: d.lat, lng: d.lng }));
      agents.forEach((a) => bounds.extend({ lat: a.lat, lng: a.lng }));
      map.fitBounds(bounds);
    }
  }, [deliveries, agents]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Calcular rota quando showRoutes está ativo
  const calculateRoute = useCallback(() => {
    if (!map || !showRoutes || agents.length === 0 || deliveries.length === 0) return;

    const directionsService = new google.maps.DirectionsService();
    const origin = { lat: agents[0].lat, lng: agents[0].lng };
    const destination = { lat: deliveries[0].lat, lng: deliveries[0].lng };
    
    const waypoints = deliveries.slice(1, 3).map((d) => ({
      location: { lat: d.lat, lng: d.lng },
      stopover: true,
    }));

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        }
      }
    );
  }, [map, showRoutes, agents, deliveries]);

  // Calcular rota quando mapa carrega
  useMemo(() => {
    if (isLoaded && map && showRoutes) {
      calculateRoute();
    }
  }, [isLoaded, map, showRoutes, calculateRoute]);

  if (loadError) {
    return (
      <div className={`flex items-center justify-center h-64 bg-muted/30 rounded-xl ${className}`}>
        <p className="text-destructive">Erro ao carregar o mapa</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center h-64 bg-muted/30 rounded-xl ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando mapa...</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={10}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* Marcadores de entregas */}
        {deliveries.map((delivery) => (
          <Marker
            key={delivery.id}
            position={{ lat: delivery.lat, lng: delivery.lng }}
            icon={getMarkerIcon(delivery.status)}
            onClick={() => setSelectedDelivery(delivery)}
          />
        ))}

        {/* Marcadores de agentes */}
        {agents.filter((a) => a.isActive).map((agent) => (
          <Marker
            key={agent.id}
            position={{ lat: agent.lat, lng: agent.lng }}
            icon={{
              url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
                  <path d="M8 12h8M12 8v8" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(32, 32),
              anchor: new google.maps.Point(16, 16),
            }}
            onClick={() => setSelectedAgent(agent)}
          />
        ))}

        {/* Rotas */}
        {directions && showRoutes && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: "#0EA5E9",
                strokeWeight: 4,
                strokeOpacity: 0.8,
              },
            }}
          />
        )}

        {/* InfoWindow para entrega selecionada */}
        {selectedDelivery && (
          <InfoWindow
            position={{ lat: selectedDelivery.lat, lng: selectedDelivery.lng }}
            onCloseClick={() => setSelectedDelivery(null)}
          >
            <div className="p-2 min-w-[200px]">
              <h4 className="font-semibold text-sm mb-1">{selectedDelivery.name}</h4>
              <p className="text-xs text-gray-600 mb-2">{selectedDelivery.address}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full ${
                  selectedDelivery.status === "pending" ? "bg-amber-100 text-amber-700" :
                  selectedDelivery.status === "in_transit" ? "bg-blue-100 text-blue-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  {selectedDelivery.status === "pending" ? "Pendente" :
                   selectedDelivery.status === "in_transit" ? "Em Trânsito" : "Entregue"}
                </span>
                {selectedDelivery.eta && (
                  <span className="text-gray-500">ETA: {selectedDelivery.eta}</span>
                )}
              </div>
              {selectedDelivery.agent && (
                <p className="text-xs mt-1 text-gray-600">Agente: {selectedDelivery.agent}</p>
              )}
            </div>
          </InfoWindow>
        )}

        {/* InfoWindow para agente selecionado */}
        {selectedAgent && (
          <InfoWindow
            position={{ lat: selectedAgent.lat, lng: selectedAgent.lng }}
            onCloseClick={() => setSelectedAgent(null)}
          >
            <div className="p-2">
              <h4 className="font-semibold text-sm mb-1">{selectedAgent.name}</h4>
              <div className="flex items-center gap-1 text-xs">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-green-600">Online</span>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Legenda */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Pendente</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Em Trânsito</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span>Agente</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryMap;
