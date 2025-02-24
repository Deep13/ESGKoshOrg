import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css"; // Ensure Leaflet CSS is imported
import L from "leaflet";
import { useSidebar } from "../context/SidebarContext";
import { Circle } from "react-leaflet";

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
  const {master} = useSidebar();
  const branchData=master?.branches;

  // const findCenterCoordinates=(coordinates)=> {
  //   let totalLat = 0, totalLong = 0;
  //   let count = coordinates.length;
     
  //       coordinates.forEach(coord => {
  //           totalLat += parseFloat(coord.lat);
  //           totalLong += parseFloat(coord.long);
  //       });
     
  //       return [
  //   (totalLat / count).toFixed(6), // Keeping 6 decimal places for precision
  //   (totalLong / count).toFixed(6)
  //       ];
  //   }

  return (
    <div className="bg-white rounded-xl border w-full h-[14rem]">
      <MapContainer
        center={[
          branchData?.[0]?.latitude ?? 0, 
          branchData?.[0]?.longitude ?? 0
        ]} // Centering on the world
        zoom={4} // Set zoom level
        scrollWheelZoom={true} // Disable scroll zoom
        zoomControl={true} // Remove + - controls
        attributionControl={false} // Remove attribution control
        style={{ height: "100%", width: "100%" }}
      >
       <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {branchData?.map((branch, index) =>
          branch.latitude && branch.longitude ? (
            <Marker key={index} position={[branch.latitude, branch.longitude]} icon={markerIcon}>
              <Popup>{branch.branch}</Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
