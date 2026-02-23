import React, { useEffect, useRef, useState } from "react";
import { Map as OlMap, View } from "ol";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { Point } from "ol/geom";
import { Feature } from "ol";
import { Style, Icon, Circle, Fill, Stroke } from "ol/style";
import { Box, Typography, Chip } from "@mui/material";
import { MyLocation } from "@mui/icons-material";
import "ol/ol.css";

interface MapComponentProps {
  selectedCountry: string;
  userLocation: { latitude: number; longitude: number } | null;
  onCountrySelect: (country: string) => void;
}

// Center on East Africa region
const DEFAULT_CENTER = fromLonLat([38, 2]);
const DEFAULT_ZOOM = 5;

const MapComponent: React.FC<MapComponentProps> = ({
  selectedCountry,
  userLocation,
  onCountrySelect,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<OlMap | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const osmLayer = new TileLayer({
      source: new OSM(),
    });

    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;

    // Modern pin style
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({ color: "#dc2626" }),
          stroke: new Stroke({ color: "#fff", width: 3 }),
        }),
      }),
    });

    const olMap = new OlMap({
      target: mapRef.current,
      layers: [osmLayer, vectorLayer],
      view: new View({
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        maxZoom: 18,
        minZoom: 3,
      }),
      controls: [],
    });

    setMap(olMap);

    return () => {
      olMap.setTarget(undefined);
    };
  }, []);

  useEffect(() => {
    if (!map || !vectorSourceRef.current) return;

    vectorSourceRef.current.clear();

    if (userLocation) {
      const { longitude, latitude } = userLocation;
      const userPoint = fromLonLat([longitude, latitude]);

      const userFeature = new Feature({
        geometry: new Point(userPoint),
      });

      vectorSourceRef.current.addFeature(userFeature);

      const currentCenter = map.getView().getCenter();
      if (!currentCenter || currentCenter[0] === DEFAULT_CENTER[0]) {
        map.getView().animate({
          center: userPoint,
          zoom: 10,
          duration: 800,
        });
      }
    }
  }, [userLocation, map]);

  return (
    <Box
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "grey.200",
        bgcolor: "#f8fafc",
      }}
    >
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "200px",
        }}
      />
      {userLocation && (
        <Box
          sx={{
            p: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            borderTop: "1px solid",
            borderColor: "grey.200",
            bgcolor: "white",
          }}
        >
          <Chip
            icon={<MyLocation sx={{ fontSize: 16 }} />}
            label={`${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`}
            size="small"
            variant="outlined"
            sx={{ fontSize: "0.75rem" }}
          />
        </Box>
      )}
    </Box>
  );
};

export default MapComponent;
