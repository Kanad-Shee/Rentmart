"use client";

import { useEffect, useRef, useState } from "react";
import type { GeocodedEquipmentLocation } from "@/lib/equipment";

type DashboardAddListingMapPreviewProps = {
  location: GeocodedEquipmentLocation;
  deliveryRadiusKm: number;
};

type GoogleMapsNamespace = {
  Map: new (
    element: HTMLElement,
    options: GoogleMapOptions,
  ) => GoogleMapInstance;
  Marker: new (
    options: {
      map: GoogleMapInstance;
      position: LatLngLiteral;
      title?: string;
    },
  ) => GoogleMarkerInstance;
  Circle: new (
    options: {
      map: GoogleMapInstance;
      center: LatLngLiteral;
      radius: number;
      fillColor?: string;
      fillOpacity?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
    },
  ) => GoogleCircleInstance;
  LatLngBounds: new () => GoogleLatLngBoundsInstance;
  importLibrary?: <T extends "maps" | "marker">(
    library: T,
  ) => Promise<T extends "maps" ? MapsLibrary : MarkerLibrary>;
};

type LatLngLiteral = {
  lat: number;
  lng: number;
};

type MapStyle = {
  featureType?: string;
  elementType?: string;
  stylers: Array<Record<string, string | number>>;
};

type GoogleMapOptions = {
  center: LatLngLiteral;
  zoom: number;
  disableDefaultUI?: boolean;
  zoomControl?: boolean;
  mapTypeControl?: boolean;
  streetViewControl?: boolean;
  fullscreenControl?: boolean;
  styles?: MapStyle[];
  mapId?: string;
};

type GoogleMapInstance = {
  setCenter: (center: LatLngLiteral) => void;
  fitBounds: (bounds: GoogleLatLngBoundsInstance, padding?: number) => void;
};

type GoogleMarkerInstance = {
  setPosition: (position: LatLngLiteral) => void;
};

type GoogleAdvancedMarkerInstance = {
  position?: LatLngLiteral;
  map?: GoogleMapInstance | null;
  title?: string;
};

type GoogleCircleInstance = {
  setCenter: (center: LatLngLiteral) => void;
  setRadius: (radius: number) => void;
  getBounds: () => GoogleLatLngBoundsInstance | null;
};

type GoogleLatLngBoundsInstance = {
  extend: (point: LatLngLiteral) => void;
  union: (bounds: GoogleLatLngBoundsInstance) => void;
};

type MapsLibrary = {
  Map: GoogleMapsNamespace["Map"];
};

type MarkerLibrary = {
  AdvancedMarkerElement: new (options: {
    map?: GoogleMapInstance | null;
    position?: LatLngLiteral;
    title?: string;
  }) => GoogleAdvancedMarkerInstance;
};

declare global {
  interface Window {
    google?: {
      maps: GoogleMapsNamespace;
    };
    __rentMartGoogleMapsPromise?: Promise<GoogleMapsNamespace>;
  }
}

const GOOGLE_MAPS_SCRIPT_ID = "rentmart-google-maps-script";
const GOOGLE_MAPS_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim() || "DEMO_MAP_ID";
const GOOGLE_MAPS_STYLE: MapStyle[] = [
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
];

function loadGoogleMapsScript(apiKey: string) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser."));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (window.__rentMartGoogleMapsPromise) {
    return window.__rentMartGoogleMapsPromise;
  }

  window.__rentMartGoogleMapsPromise = new Promise<GoogleMapsNamespace>((resolve, reject) => {
    const googleWindow = (window.google ||= { maps: {} as GoogleMapsNamespace });
    const mapsNamespace = (googleWindow.maps ||= {} as GoogleMapsNamespace);

    if (mapsNamespace.importLibrary) {
      resolve(mapsNamespace);
      return;
    }

    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (window.google?.maps?.importLibrary) {
          resolve(window.google.maps);
          return;
        }

        reject(new Error("Google Maps loaded without the importLibrary API."));
      });
      existingScript.addEventListener("error", () => {
        reject(new Error("Unable to load Google Maps."));
      });
      return;
    }

    const requestedLibraries = new Set<string>();
    const queryParams = new URLSearchParams();
    let loaderPromise: Promise<void> | null = null;

    const injectScript = () => {
      if (!loaderPromise) {
        loaderPromise = new Promise<void>((loaderResolve, loaderReject) => {
          const script = document.createElement("script");
          script.id = GOOGLE_MAPS_SCRIPT_ID;
          queryParams.set("libraries", [...requestedLibraries].join(","));
          queryParams.set("key", apiKey);
          queryParams.set("v", "weekly");
          queryParams.set("loading", "async");
          queryParams.set("callback", "google.maps.__ib__");
          script.src = `https://maps.googleapis.com/maps/api/js?${queryParams.toString()}`;
          script.async = true;
          script.onerror = () => {
            loaderReject(new Error("Unable to load Google Maps."));
          };

          (mapsNamespace as GoogleMapsNamespace & { __ib__?: () => void }).__ib__ = () => {
            loaderResolve();
          };

          document.head.appendChild(script);
        });
      }

      return loaderPromise;
    };

    mapsNamespace.importLibrary = ((
      library: "maps" | "marker",
    ) => {
      requestedLibraries.add(library);

      return injectScript().then(() => {
        const loadedMaps = window.google?.maps as GoogleMapsNamespace | undefined;
        if (!loadedMaps?.importLibrary) {
          throw new Error("Google Maps library loading did not finish correctly.");
        }

        return loadedMaps.importLibrary(library);
      });
    }) as GoogleMapsNamespace["importLibrary"];

    resolve(mapsNamespace);
  });

  return window.__rentMartGoogleMapsPromise;
}

export function DashboardAddListingMapPreview({
  location,
  deliveryRadiusKm,
}: DashboardAddListingMapPreviewProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMapInstance | null>(null);
  const markerRef = useRef<GoogleAdvancedMarkerInstance | null>(null);
  const circleRef = useRef<GoogleCircleInstance | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";

  useEffect(() => {
    let isCancelled = false;

    async function initializeMap() {
      if (!mapElementRef.current) {
        return;
      }

      if (!apiKey) {
        setMapError("Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to show the location preview.");
        return;
      }

      try {
        const maps = await loadGoogleMapsScript(apiKey);
        if (!maps.importLibrary) {
          throw new Error("Google Maps importLibrary API is unavailable.");
        }

        const { Map } = await maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await maps.importLibrary("marker");

        if (isCancelled || !mapElementRef.current) {
          return;
        }

        const center = {
          lat: location.latitude,
          lng: location.longitude,
        };

        if (!mapRef.current) {
          mapRef.current = new Map(mapElementRef.current, {
            center,
            zoom: 12,
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            mapId: GOOGLE_MAPS_MAP_ID,
            styles: GOOGLE_MAPS_STYLE,
          });

          markerRef.current = new AdvancedMarkerElement({
            map: mapRef.current,
            position: center,
            title: location.normalizedAddress,
          });

          circleRef.current = new maps.Circle({
            map: mapRef.current,
            center,
            radius: deliveryRadiusKm * 1000,
            fillColor: "#5cab7d",
            fillOpacity: 0.22,
            strokeColor: "#1b4332",
            strokeOpacity: 0.8,
            strokeWeight: 2,
          });
        }

        if (markerRef.current) {
          markerRef.current.position = center;
          markerRef.current.map = mapRef.current;
          markerRef.current.title = location.normalizedAddress;
        }
        circleRef.current?.setCenter(center);
        circleRef.current?.setRadius(deliveryRadiusKm * 1000);
        mapRef.current.setCenter(center);

        const bounds = new maps.LatLngBounds();
        bounds.extend(center);

        const circleBounds = circleRef.current?.getBounds();
        if (circleBounds) {
          bounds.union(circleBounds);
        }

        mapRef.current.fitBounds(bounds, 48);
        setMapError(null);
      } catch (error) {
        if (!isCancelled) {
          setMapError(
            error instanceof Error ? error.message : "Unable to load the map preview.",
          );
        }
      }
    }

    initializeMap();

    return () => {
      isCancelled = true;
    };
  }, [apiKey, deliveryRadiusKm, location.latitude, location.longitude, location.normalizedAddress]);

  if (mapError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="max-w-xs rounded-xl border border-[#ffd9d4] bg-[#fff4f2] p-4 text-center text-sm font-medium text-[#7a120c] shadow-sm">
          {mapError}
        </div>
      </div>
    );
  }

  return <div ref={mapElementRef} className="absolute inset-0" aria-label="Selected listing location map" />;
}
