import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css"; // Ensure Leaflet CSS is imported
import L from "leaflet";

// Fix missing marker issue
const markerIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});


const MapComponent = () => {
  return (
    <div className="bg-white rounded-xl border w-full h-[12rem]">
      <MapContainer
        center={[20, 0]} // Centering on the world
        zoom={0} // Set zoom level
        scrollWheelZoom={false} // Disable scroll zoom
        zoomControl={false} // Remove + - controls
        attributionControl={false} // Remove attribution control
        style={{ height: "100%", width: "100%" }}
      >
       <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[51.505, -0.09]} icon={markerIcon}>
          <Popup>This is dummy location <br /> test.</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;
