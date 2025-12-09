import { useState, useCallback } from 'react';
import { geocodingApi, Coordinates } from '@/lib/api';
import { toast } from 'sonner';

interface UseGeocodingResult {
  coordinates: Coordinates | null;
  address: string;
  isLoading: boolean;
  error: string | null;
  geocodeAddress: (address: string) => Promise<Coordinates | null>;
  reverseGeocode: (lat: number, lng: number) => Promise<string | null>;
  clearCoordinates: () => void;
}

export const useGeocoding = (): UseGeocodingResult => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocodeAddress = useCallback(async (inputAddress: string): Promise<Coordinates | null> => {
    if (!inputAddress.trim()) {
      setError('Endereço não pode ser vazio');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await geocodingApi.geocode(inputAddress);
      setCoordinates(result);
      setAddress(inputAddress);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao geocodificar endereço';
      setError(message);
      toast.error('Erro ao buscar coordenadas', {
        description: message,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await geocodingApi.reverseGeocode(lat, lng);
      setAddress(result.address);
      setCoordinates({ lat, lng });
      return result.address;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar endereço';
      setError(message);
      toast.error('Erro ao buscar endereço', {
        description: message,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCoordinates = useCallback(() => {
    setCoordinates(null);
    setAddress('');
    setError(null);
  }, []);

  return {
    coordinates,
    address,
    isLoading,
    error,
    geocodeAddress,
    reverseGeocode,
    clearCoordinates,
  };
};
