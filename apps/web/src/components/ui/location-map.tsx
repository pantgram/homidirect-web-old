import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LocationMapProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lon: number) => void;
  className?: string;
}

const DEFAULT_CENTER: [number, number] = [39.0742, 21.8243];
const DEFAULT_ZOOM = 6;
const SELECTED_ZOOM = 16;

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapClickHandler({ onLocationChange }: { onLocationChange: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapCenterUpdater({ latitude, longitude }: { latitude: number | null; longitude: number | null }) {
  const map = useMap();
  const prevRef = useRef<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      if (prevRef.current && prevRef.current.lat === latitude && prevRef.current.lon === longitude) {
        return;
      }
      prevRef.current = { lat: latitude, lon: longitude };
      map.setView([latitude, longitude], SELECTED_ZOOM, { animate: true });
    }
  }, [latitude, longitude, map]);

  return null;
}

function DraggableMarker({
  latitude,
  longitude,
  onLocationChange,
}: {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lon: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  if (latitude === null || longitude === null) {
    return null;
  }

  return (
    <Marker
      position={[latitude, longitude]}
      icon={markerIcon}
      draggable={true}
      ref={markerRef}
      eventHandlers={{
        dragend() {
          const marker = markerRef.current;
          if (marker) {
            const pos = marker.getLatLng();
            onLocationChange(pos.lat, pos.lng);
          }
        },
      }}
    />
  );
}

export function LocationMap({
  latitude,
  longitude,
  onLocationChange,
  className,
}: LocationMapProps) {
  return (
    <div className={className}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: "300px", width: "100%", borderRadius: "8px" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onLocationChange={onLocationChange} />
        <MapCenterUpdater latitude={latitude} longitude={longitude} />
        <DraggableMarker
          latitude={latitude}
          longitude={longitude}
          onLocationChange={onLocationChange}
        />
      </MapContainer>
    </div>
  );
}
