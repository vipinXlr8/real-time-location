const socket = io();

const map = L.map("map").setView([0, 0], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '<a href="https://www.linkedin.com/in/vipin-mishra" target="_blank">Vipin Mishra</a>',
}).addTo(map);

const icons = {
  location: L.icon({
    iconUrl: "https://img.icons8.com/ios-filled/50/000000/marker.png",
    iconSize: [24, 24],
  }),
  person: L.icon({
    iconUrl: "https://img.icons8.com/ios-filled/50/000000/user.png",
    iconSize: [24, 24],
  }),
  doctor: L.icon({
    iconUrl: "https://img.icons8.com/ios-filled/50/000000/doctor-male.png",
    iconSize: [24, 24],
  }),
  car: L.icon({
    iconUrl: "https://img.icons8.com/ios-filled/50/000000/car.png",
    iconSize: [24, 24],
  }),
  bike: L.icon({
    iconUrl: "https://img.icons8.com/ios-filled/50/000000/bicycle.png",
    iconSize: [24, 24],
  }),
};

const markers = {};
let currentPosition = null;

const errorMessage = document.getElementById("error-message");
const retryButton = document.getElementById("retry-button");

retryButton.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      currentPosition = { latitude, longitude };
      emitLocation();
      errorMessage.style.display = "none";
    },
    () => {
      errorMessage.style.display = "block";
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    }
  );
});

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      currentPosition = { latitude, longitude };
      emitLocation();
      errorMessage.style.display = "none";
    },
    (error) => {
      console.error(error);
      errorMessage.style.display = "block";
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    }
  );
} else {
  errorMessage.textContent = "Geolocation is not supported by this browser.";
  errorMessage.style.display = "block";
}

function emitLocation() {
  if (currentPosition) {
    const selectedType = document.querySelector('input[name="marker-type"]:checked').value;
    socket.emit("Send-location", { ...currentPosition, type: selectedType });
  }
}

socket.on("receive-location", (data) => {
  const { id, latitude, longitude, type } = data;
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
    markers[id].setIcon(icons[type]);
  } else {
    markers[id] = L.marker([latitude, longitude], { icon: icons[type] }).addTo(map);
  }
  map.setView([latitude, longitude]);
});

socket.on("disconnected-location", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});

document.getElementById("marker-select").addEventListener("change", () => {
  emitLocation();
});
