const cityRiskData = [
  {
    name: "Chennai",
    lat: 13.0827,
    lng: 80.2707,
    risk: "High",
    reason: "Low-lying coastline and heavy monsoon flooding raise sea-level-rise vulnerability."
  },
  {
    name: "Mumbai",
    lat: 19.076,
    lng: 72.8777,
    risk: "High",
    reason: "High-density coastal development and frequent high-tide flooding increase exposure."
  },
  {
    name: "Kolkata",
    lat: 22.5726,
    lng: 88.3639,
    risk: "Medium",
    reason: "Deltaic terrain and river-coast interactions create moderate flood and salinity stress."
  },
  {
    name: "Visakhapatnam",
    lat: 17.6868,
    lng: 83.2185,
    risk: "Medium",
    reason: "Cyclone-prone coast with erosion and moderate elevation-related flood risks."
  },
  {
    name: "Kochi",
    lat: 9.9312,
    lng: 76.2673,
    risk: "Low",
    reason: "Localized flooding exists, but overall long-term exposure is lower than major metros."
  }
];

const INDIA_CENTER = [22.9734, 78.6569];
const INDIA_ZOOM = 5;

const riskColorMap = {
  High: "#ef4444",
  Medium: "#f59e0b",
  Low: "#10b981"
};

const map = L.map("riskMap").setView(INDIA_CENTER, INDIA_ZOOM);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const markerByCity = {};

cityRiskData.forEach((city) => {
  const marker = L.circleMarker([city.lat, city.lng], {
    radius: city.risk === "High" ? 10 : 8,
    color: "#ffffff",
    weight: 2,
    fillColor: riskColorMap[city.risk],
    fillOpacity: 0.95
  }).addTo(map);

  marker.bindPopup(`
    <div style="font-family:Segoe UI,Tahoma,sans-serif;line-height:1.4;">
      <h3 style="margin:0 0 6px 0;font-size:16px;">${city.name}</h3>
      <p style="margin:0 0 6px 0;"><strong>Risk Level:</strong> ${city.risk}</p>
      <p style="margin:0;">${city.reason}</p>
    </div>
  `);

  markerByCity[city.name] = marker;
});

const cityList = document.getElementById("cityList");

cityRiskData.forEach((city) => {
  const li = document.createElement("li");
  li.style.marginBottom = "10px";

  const button = document.createElement("button");
  button.type = "button";
  button.style.width = "100%";
  button.style.textAlign = "left";
  button.style.padding = "10px 12px";
  button.style.borderRadius = "10px";
  button.style.border = "1px solid rgba(100,210,255,0.35)";
  button.style.background = "rgba(6,23,42,0.4)";
  button.style.color = "#e8f4f8";
  button.style.cursor = "pointer";
  button.style.transition = "all 0.25s ease";
  button.innerHTML = `<strong>${city.name}</strong> <span style="float:right;color:${riskColorMap[city.risk]};font-weight:700;">${city.risk}</span>`;

  button.addEventListener("mouseenter", () => {
    button.style.transform = "translateY(-2px)";
    button.style.borderColor = "rgba(125,211,252,0.8)";
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "translateY(0px)";
    button.style.borderColor = "rgba(100,210,255,0.35)";
  });

  button.addEventListener("click", () => {
    map.flyTo([city.lat, city.lng], 7, { duration: 1.2 });
    markerByCity[city.name].openPopup();
  });

  li.appendChild(button);
  cityList.appendChild(li);
});

document.getElementById("resetViewBtn").addEventListener("click", () => {
  map.flyTo(INDIA_CENTER, INDIA_ZOOM, { duration: 1.2 });
});