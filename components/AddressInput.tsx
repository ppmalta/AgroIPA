import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Loader2, Check, X, Navigation } from 'lucide-react';
import { useGeocoding } from '@/hooks/useGeocoding';
import { cn } from '@/lib/utils';

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onCoordinatesChange?: (coords: { lat: number; lng: number } | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const AddressInput = ({
  value,
  onChange,
  onCoordinatesChange,
  placeholder = 'Digite o endereço...',
  className,
  disabled = false,
}: AddressInputProps) => {
  const { coordinates, isLoading, error, geocodeAddress, clearCoordinates } = useGeocoding();
  const [inputValue, setInputValue] = useState(value);
  const [hasGeocoded, setHasGeocoded] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (coordinates) {
      onCoordinatesChange?.(coordinates);
      setHasGeocoded(true);
    }
  }, [coordinates, onCoordinatesChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setHasGeocoded(false);
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  };

  const handleGeocode = useCallback(async () => {
    if (!inputValue.trim()) return;
    await geocodeAddress(inputValue);
  }, [inputValue, geocodeAddress]);

  const handleClear = () => {
    setInputValue('');
    onChange('');
    clearCoordinates();
    onCoordinatesChange?.(null);
    setHasGeocoded(false);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onCoordinatesChange?.(coords);
        setHasGeocoded(true);
        // Optionally reverse geocode to get address
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={cn(
              'pl-10 pr-10',
              hasGeocoded && coordinates && 'border-green-500 focus-visible:ring-green-500'
            )}
            disabled={disabled || isLoading}
          />
          {inputValue && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleGeocode}
          disabled={!inputValue.trim() || isLoading || disabled}
          title="Buscar coordenadas"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : hasGeocoded && coordinates ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleUseCurrentLocation}
          disabled={isLoading || disabled}
          title="Usar localização atual"
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>

      {/* Coordinates Display */}
      {coordinates && hasGeocoded && (
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="secondary" className="font-mono">
            {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </Badge>
          <span className="text-green-600 flex items-center gap-1">
            <Check className="h-3 w-3" />
            Coordenadas obtidas
          </span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
};

export default AddressInput;
