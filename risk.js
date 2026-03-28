const API_BASE = "http://localhost:5001/api";
const INDIA_CENTER = [22.9734, 78.6569];
const INDIA_ZOOM = 5;

const riskColorMap = {
  High: "#ef4444",
  Medium: "#f59e0b",
  Low: "#10b981",
  "High Risk": "#ef4444",
  "Medium Risk": "#f59e0b",
  "Low Risk": "#10b981"
};

const cityList = document.getElementById("cityList");
const citySummaryIntro = document.getElementById("citySummaryIntro");
const mapStatus = document.getElementById("mapStatus");
const reportsStatus = document.getElementById("reportsStatus");
const reportsList = document.getElementById("reportsList");
const resetViewBtn = document.getElementById("resetViewBtn");

const markerByCity = {};
let map = null;

function initializeMap() {
  if (typeof L === "undefined") {
    throw new Error("Leaflet did not load");
  }

  map = L.map("riskMap").setView(INDIA_CENTER, INDIA_ZOOM);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
}

function normalizeRisk(risk) {
  if (!risk) {
    return "Low";
  }
  if (risk === "High Risk") {
    return "High";
  }
  if (risk === "Medium Risk") {
    return "Medium";
  }
  if (risk === "Low Risk") {
    return "Low";
  }
  return risk;
}

function buildReason(city) {
  const normalizedRisk = normalizeRisk(city.risk);
  if (normalizedRisk === "High") {
    return city.city + " faces severe coastal exposure with significant flood and infrastructure risk.";
  }
  if (normalizedRisk === "Medium") {
    return city.city + " faces moderate coastal pressure and should strengthen flood resilience planning.";
  }
  return city.city + " currently shows lower relative exposure but still requires long-term monitoring.";
}

function createPopupMarkup(city) {
  return `
    <div style="font-family:Segoe UI,Tahoma,sans-serif;line-height:1.4;">
      <h3 style="margin:0 0 6px 0;font-size:16px;">${city.city}</h3>
      <p style="margin:0 0 6px 0;"><strong>Risk Level:</strong> ${normalizeRisk(city.risk)}</p>
      <p style="margin:0;">${buildReason(city)}</p>
    </div>
  `;
}

function renderCitySummary(cities) {
  cityList.innerHTML = "";

  if (!cities.length) {
    citySummaryIntro.textContent = "No backend city data is available right now.";
    cityList.innerHTML = '<li class="city-empty">No cities available from /api/risk-data.</li>';
    return;
  }

  citySummaryIntro.textContent = "Click a city below to move the map and open its risk popup.";

  cities.forEach((city) => {
    const normalizedRisk = normalizeRisk(city.risk);
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
    button.innerHTML = `<strong>${city.city}</strong> <span style="float:right;color:${riskColorMap[normalizedRisk]};font-weight:700;">${normalizedRisk}</span>`;

    button.addEventListener("mouseenter", () => {
      button.style.transform = "translateY(-2px)";
      button.style.borderColor = "rgba(125,211,252,0.8)";
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "translateY(0px)";
      button.style.borderColor = "rgba(100,210,255,0.35)";
    });

    button.addEventListener("click", () => {
      if (!map || !markerByCity[city.city]) {
        return;
      }
      map.flyTo([city.latitude, city.longitude], 7, { duration: 1.2 });
      markerByCity[city.city].openPopup();
    });

    li.appendChild(button);
    cityList.appendChild(li);
  });
}

function renderMap(cities) {
  if (!map) {
    return;
  }

  Object.values(markerByCity).forEach((marker) => {
    map.removeLayer(marker);
  });

  cities.forEach((city) => {
    const normalizedRisk = normalizeRisk(city.risk);
    const marker = L.circleMarker([city.latitude, city.longitude], {
      radius: normalizedRisk === "High" ? 10 : 8,
      color: "#ffffff",
      weight: 2,
      fillColor: riskColorMap[normalizedRisk],
      fillOpacity: 0.95
    }).addTo(map);

    marker.bindPopup(createPopupMarkup(city));
    markerByCity[city.city] = marker;
  });
}

async function loadRiskData() {
  try {
    if (!map) {
      initializeMap();
    }

    const response = await fetch(API_BASE + "/risk-data");
    if (!response.ok) {
      throw new Error("Could not load risk data");
    }

    const cities = await response.json();
    renderMap(cities);
    renderCitySummary(cities);
    mapStatus.textContent = "Loaded " + cities.length + " cities from the backend.";
  } catch (error) {
    mapStatus.textContent = "Unable to load the map or /api/risk-data right now.";
    citySummaryIntro.textContent = "Backend city data could not be loaded, but submitted reports can still appear below.";
    cityList.innerHTML = '<li class="city-empty">Start the backend server on port 5001 to load live city data.</li>';
  }
}

function renderReports(reports) {
  reportsList.innerHTML = "";

  const uniqueReports = [];
  const seenReports = new Set();

  reports.forEach((report) => {
    const key = [
      (report.location || "").trim().toLowerCase(),
      (report.risk || "").trim().toLowerCase(),
      (report.source || "").trim().toLowerCase()
    ].join("|");

    if (!seenReports.has(key)) {
      seenReports.add(key);
      uniqueReports.push(report);
    }
  });

  if (!uniqueReports.length) {
    reportsList.innerHTML = '<div class="reports-empty">No reports submitted yet. Use the predictor or the visuals form to add one.</div>';
    reportsStatus.textContent = "No submitted reports available yet.";
    return;
  }

  reportsStatus.textContent = "Showing " + uniqueReports.length + " submitted report" + (uniqueReports.length === 1 ? "" : "s") + ".";

  uniqueReports
    .slice()
    .reverse()
    .forEach((report) => {
      const item = document.createElement("article");
      item.className = "report-item";
      item.innerHTML = `
        <h5>${report.location}</h5>
        <p><strong>Risk:</strong> ${report.risk}</p>
        <p class="report-meta">Source: ${report.source || "unknown"}</p>
      `;
      reportsList.appendChild(item);
    });
}

async function loadReports() {
  try {
    const response = await fetch(API_BASE + "/reports");
    if (!response.ok) {
      throw new Error("Could not load reports");
    }

    const reports = await response.json();
    renderReports(reports);
  } catch (error) {
    reportsStatus.textContent = "Unable to load /api/reports right now.";
    reportsList.innerHTML = '<div class="reports-empty">Start the backend server on port 5001 to view submitted reports.</div>';
  }
}

resetViewBtn.addEventListener("click", () => {
  if (!map) {
    return;
  }
  map.flyTo(INDIA_CENTER, INDIA_ZOOM, { duration: 1.2 });
});

loadRiskData();
loadReports();
