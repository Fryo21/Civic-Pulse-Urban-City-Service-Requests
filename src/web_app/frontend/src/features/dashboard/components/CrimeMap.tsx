import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet.heat";

import "leaflet/dist/leaflet.css";

import type { CrimeLocation } from "../types/dashboard";

const FOCUS_ZOOM = 16;

interface CrimeMapProps {
  locations: CrimeLocation[];
  mapMode: "heatmap" | "points";
  /** The category currently selected in the hotspot filter ("all" means
   * every category is included in each point's aggregated count). */
  category: string;
  /** Location to fly to and highlight, e.g. when a "Top crime locations"
   * row is clicked. Passing the same location object again re-triggers
   * the fly-to even if the map has since been panned elsewhere. */
  focusLocation: CrimeLocation | null;
}

export default function CrimeMap({
  locations,
  mapMode,
  category,
  focusLocation,
}: CrimeMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const visualLayer = useRef<L.Layer | null>(null);

  // Create map once
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) {
      return;
    }

    const map = L.map(mapContainer.current).setView(
      [51.5072, -0.1276],
      10
    );

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    ).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
      visualLayer.current = null;
    };
  }, []);

  // Change between points and heatmap
  useEffect(() => {
    const map = mapInstance.current;

    if (!map || locations.length === 0) {
      return;
    }

    // Remove previous visual layer
    if (visualLayer.current) {
      map.removeLayer(visualLayer.current);
    }

    if (mapMode === "points") {
      const pointLayer = L.layerGroup();

      locations.forEach((location) => {
        const bubble = L.circleMarker(
          [location.latitude, location.longitude],
          {
            radius: Math.max(
              6,
              Math.min(location.count / 10, 20)
            ),
            fillOpacity: 0.65,
            weight: 2,
          }
        );

        bubble.bindPopup(`
          <strong>${location.street}</strong>
          <br />
          Category: ${category === "all" ? "All categories" : category}
          <br />
          Crimes: ${location.count}
        `);

        bubble.addTo(pointLayer);
      });

      pointLayer.addTo(map);
      visualLayer.current = pointLayer;

      return;
    }

    // Heatmap
    const maxCount = Math.max(
      ...locations.map((location) => location.count)
    );

    const heatPoints: L.HeatLatLngTuple[] =
      locations.map((location) => [
        location.latitude,
        location.longitude,
        location.count / maxCount,
      ]);

    const heatLayer = L.heatLayer(heatPoints, {
      radius: 35,
      blur: 25,
      maxZoom: 14,
    });

    heatLayer.addTo(map);

    visualLayer.current = heatLayer;
  }, [locations, mapMode, category]);

  // Fly to a location picked from the "Top crime locations" list.
  useEffect(() => {
    const map = mapInstance.current;

    if (!map || !focusLocation) {
      return;
    }

    map.flyTo(
      [focusLocation.latitude, focusLocation.longitude],
      FOCUS_ZOOM
    );
  }, [focusLocation]);

  return <div ref={mapContainer} className="crime-map" />;
}
