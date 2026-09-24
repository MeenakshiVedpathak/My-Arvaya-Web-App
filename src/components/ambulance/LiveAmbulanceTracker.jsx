import React, { useState, useEffect, useRef } from "react";
import { Truck, Clock, Plus, Minus, MapPin } from "lucide-react";
import { startAmbulanceTracking, GOOGLE_MAPS_API_KEY } from "../../services/ambulanceService";

const STATUS_LABELS = {
  requested: "Requested",
  assigned: "Assigned",
  dispatched: "Dispatched",
  arriving: "Arriving",
  completed: "Completed",
  delayed: "Delayed",
  unavailable: "Unavailable",
  cancelled: "Cancelled",
};

const STATUS_COLORS = {
  requested: { bg: "var(--request-bg)", color: "var(--request)", border: "var(--request-soft)" },
  assigned: { bg: "var(--info-bg)", color: "var(--info)", border: "var(--info-soft)" },
  dispatched: { bg: "#e0e7ff", color: "#4f46e5", border: "#a5b4fc" },
  arriving: { bg: "#ccfbf1", color: "#0d9488", border: "#5eead4" },
  completed: { bg: "var(--success-bg)", color: "var(--success)", border: "#86efac" },
  delayed: { bg: "#ffedd5", color: "#ea580c", border: "#fdba74" },
  unavailable: { bg: "#fee2e2", color: "#dc2626", border: "#fca5a5" },
  cancelled: { bg: "#fee2e2", color: "#dc2626", border: "#fca5a5" },
};

const DEFAULT_CENTER = [20.5937, 78.9629];
const POLL_INTERVAL_MS = 10000;

function useGoogleMapsScript(apiKey, libraries = []) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!apiKey) {
      setError(new Error("Google Maps API key is missing"));
      return;
    }

    if (window.google && window.google.maps) {
      setLoaded(true);
      return;
    }

    const libs = libraries.join(",");
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libs}&v=weekly`;
    script.async = true;
    script.defer = true;

    script.onload = () => setLoaded(true);
    script.onerror = () => setError(new Error("Failed to load Google Maps script"));

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [apiKey, libraries]);

  return { loaded, error };
}

export default function LiveAmbulanceTracker({ requestId, pickupLat, pickupLng, pickupAddress, onTrackingData, live = true }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const lastLocationMarkerRef = useRef(null);
  const infoWindowRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const pollingRef = useRef(null);

  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { loaded: mapsLoaded, error: mapsError } = useGoogleMapsScript(GOOGLE_MAPS_API_KEY);

useEffect(() => {
    if (!mapsLoaded || mapInstanceRef.current) return;

    const lat = tracking?.latitude || tracking?.pickupLat || pickupLat || null;
    const lng = tracking?.longitude || tracking?.pickupLng || pickupLng || null;
    if (lat == null || lng == null) return;

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: tracking?.latitude != null && tracking?.longitude != null ? 16 : 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_TOP,
        },
        gestureHandling: "auto",
      });

      mapInstanceRef.current = map;

      const ambMarker = new window.google.maps.Marker({
        position: { lat, lng },
        map,
        title: "Ambulance",
      });
      markerRef.current = ambMarker;

      polylineRef.current = new window.google.maps.Polyline({
        map,
        path: [],
        strokeColor: "#dc2626",
        strokeOpacity: 0.8,
        strokeWeight: 4,
        icons: [{
          symbol: "l",
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 4,
          strokeColor: "#dc2626",
        }],
      });

      infoWindowRef.current = new window.google.maps.InfoWindow();
    } catch (e) {
      console.error("Error initializing Google Map:", e);
      setError(e.message || "Failed to initialize map");
    }
  }, [mapsLoaded, tracking?.latitude, tracking?.longitude, pickupLat, pickupLng]);

  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current || pickupMarkerRef.current) return;
    if (pickupLat == null || pickupLng == null) return;

    try {
      pickupMarkerRef.current = new window.google.maps.Marker({
        position: { lat: Number(pickupLat), lng: Number(pickupLng) },
        map: mapInstanceRef.current,
        title: "Pickup Location",
        icon: {
          url: "data:image/svg+xml," + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#2563eb" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
          ),
          scaledSize: new window.google.maps.Size(24, 24),
        },
      });
    } catch (e) {
      console.error("Error adding pickup marker:", e);
    }
  }, [mapsLoaded, pickupLat, pickupLng]);

  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current) return;

    const m = markerRef.current;
    if (!m) return;

    try {
      if (tracking?.latitude && tracking?.longitude) {
        m.setPosition({ lat: tracking.latitude, lng: tracking.longitude });
        mapInstanceRef.current.setCenter({ lat: tracking.latitude, lng: tracking.longitude });
        mapInstanceRef.current.setZoom(16);

        let content = "";
        if (infoWindowRef.current) {
          const sc = STATUS_COLORS[tracking.status] || STATUS_COLORS.requested;
          content = `
            <div style="font-size:13px;padding:4px 0">
              <div style="font-weight:700;margin-bottom:4px">Ambulance ${tracking.ambulanceNo || ""}</div>
              <div style="display:flex;align-items:center;gap:6px">
                <span style="background:${sc.bg};color:${sc.color};padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;border:1px solid ${sc.border}">
                  ${STATUS_LABELS[tracking.status] || tracking.status || "Tracking"}
                </span>
              </div>
              ${tracking.driverName ? `<div style="margin-top:4px">Driver: ${tracking.driverName}</div>` : ""}
              ${tracking.eta ? `<div style="margin-top:4px">ETA: ${tracking.eta} min</div>` : ""}
            </div>
          `;
          infoWindowRef.current.setContent(content);
          if (!infoWindowRef.current.getMap()) {
            infoWindowRef.current.open(mapInstanceRef.current, m);
          }
        }
      } else if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    } catch (e) {
      console.error("Error updating map marker:", e);
    }
  }, [tracking, mapsLoaded, pickupLat, pickupLng]);

  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current) return;

    const history = tracking?.locationHistory || [];
    const historyPath = history
      .filter(h => h.lat != null && h.lng != null)
      .map(h => ({ lat: h.lat, lng: h.lng }));

    const lastHistory = historyPath.length > 0 ? historyPath[historyPath.length - 1] : null;

    if (lastHistory && lastLocationMarkerRef.current) {
      lastLocationMarkerRef.current.setPosition(lastHistory);
    } else if (lastHistory && !lastLocationMarkerRef.current) {
      lastLocationMarkerRef.current = new window.google.maps.Marker({
        position: lastHistory,
        map: mapInstanceRef.current,
        title: "Last Recorded Location",
        icon: {
          url: "data:image/svg+xml," + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/></svg>'
          ),
          scaledSize: new window.google.maps.Size(22, 22),
        },
      });
    }

    if (polylineRef.current) {
      const pickupPoint =
        (pickupLat != null && pickupLng != null)
          ? { lat: Number(pickupLat), lng: Number(pickupLng) }
          : null;
      const path = [];
      if (pickupPoint) path.push(pickupPoint);
      historyPath.forEach(p => path.push(p));
      if (tracking?.latitude && tracking?.longitude) {
        path.push({ lat: tracking.latitude, lng: tracking.longitude });
      }
      polylineRef.current.setPath(path);
    }
  }, [tracking, mapsLoaded, pickupLat, pickupLng]);

  useEffect(() => {
    if (!mapsLoaded || !window.google?.maps?.DirectionsService) return;

    const hasPickup = pickupLat != null && pickupLng != null;
    const hasCurrent = tracking?.latitude && tracking?.longitude;
    if (!hasPickup || !hasCurrent) return;

    const pickup = { lat: Number(pickupLat), lng: Number(pickupLng) };
    const current = { lat: tracking.latitude, lng: tracking.longitude };

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: pickup,
        destination: current,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK && result?.routes?.length && polylineRef.current) {
          const route = result.routes[0];
          const path = route.legs.flatMap(leg => leg.steps.flatMap(step => step.points));
          polylineRef.current.setPath(path);
        }
      }
    );
  }, [mapsLoaded, tracking?.latitude, tracking?.longitude, pickupLat, pickupLng]);

  useEffect(() => {
    if (!requestId) return;

    setError(mapsError);

    pollingRef.current = startAmbulanceTracking(
      requestId,
      (data) => {
        setTracking(data);
        onTrackingData?.(data);
        setLoading(false);
        setError(null);
      },
      POLL_INTERVAL_MS,
      () => {
      }
    );

    return () => {
      if (pollingRef.current) {
        pollingRef.current();
        pollingRef.current = null;
      }
    };
  }, [requestId, mapsError, onTrackingData]);

  const sc = (tracking?.status || "").toLowerCase();
  const statusColor = STATUS_COLORS[sc] || STATUS_COLORS.requested;
  const statusLabel = STATUS_LABELS[sc] || tracking?.status || "—";

  return (
    <div className="live-tracker" style={{ height: "100%", minHeight: "300px", borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden", position: "relative", background: "var(--bg-app)" }}>
      {(!mapsLoaded && !error && !mapsError) ? (
        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "10px", color: "var(--text-muted)" }}>
          <div style={{ width: "32px", height: "32px", border: "3px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span style={{ fontSize: "12px" }}>Loading map…</span>
        </div>
      ) : (mapsError || error) ? (
        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "8px", color: "var(--text-muted)", padding: "16px", textAlign: "center" }}>
          <MapPin size={24} color="var(--danger)" />
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {(mapsError?.message || error?.message || "Map failed to load")}
          </span>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                delete window.google;
                window.location.reload();
              }
            }}
            style={{ padding: "4px 12px", fontSize: "11px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-main)", cursor: "pointer" }}
          >
            Retry
          </button>
        </div>
      ) : (
          <>
           <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
           <div style={{ position: "absolute", top: "8px", right: "8px", display: "flex", flexDirection: "column", gap: "4px", zIndex: 2 }}>
             <button
               onClick={() => { if (mapInstanceRef.current) mapInstanceRef.current.setZoom((mapInstanceRef.current.getZoom() || 15) + 1); }}
               style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-main)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
               title="Zoom in"
             >
               <Plus size={16} />
             </button>
             <button
               onClick={() => { if (mapInstanceRef.current) mapInstanceRef.current.setZoom((mapInstanceRef.current.getZoom() || 15) - 1); }}
               style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-main)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
               title="Zoom out"
             >
               <Minus size={16} />
             </button>
           </div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "var(--bg-surface)", borderTop: "1px solid var(--border)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#fff", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Truck size={14} color="var(--primary)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)" }}>
                  {tracking?.driverName || (sc === "dispatched" || sc === "arriving" ? "Driver assigned" : "Awaiting driver")}
                </div>
                {pickupAddress && (
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {pickupAddress}
                  </div>
                )}
              </div>
            </div>

            {tracking?.eta && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "var(--primary-light)", padding: "4px 10px", borderRadius: "14px", flexShrink: 0 }}>
                <Clock size={12} color="var(--primary)" />
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--primary)" }}>{tracking.eta} min</span>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "20px", background: statusColor.bg, color: statusColor.color, fontSize: "11px", fontWeight: "700", border: `1px solid ${statusColor.border}`, flexShrink: 0 }}>
              {statusLabel}
            </div>
          </div>
        </>
      )}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
