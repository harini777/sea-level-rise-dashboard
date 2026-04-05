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

const riskPredictorForm = document.getElementById("riskPredictorForm");
const predictorResult = document.getElementById("predictorResult");

const predictorFields = {
  elevation: {
    input: document.getElementById("elevationInput"),
    error: document.getElementById("elevationError"),
    min: 0,
    max: 100,
    label: "Elevation"
  },
  distance: {
    input: document.getElementById("distanceInput"),
    error: document.getElementById("distanceError"),
    min: 0,
    max: 200,
    label: "Distance from coast"
  },
  floods: {
    input: document.getElementById("floodsInput"),
    error: document.getElementById("floodsError"),
    min: 0,
    max: 50,
    label: "Flood events"
  }
};

const resultContentByRisk = {
  Low: {
    className: "low-risk",
    explanation: "Low current exposure. The site has relatively safer elevation or shoreline distance, but periodic monitoring and drainage planning still matter.",
    summary: "Recommended focus: keep monitoring shoreline change, protect drainage systems, and review long-term adaptation plans."
  },
  Medium: {
    className: "medium-risk",
    explanation: "Moderate coastal stress. One or more indicators suggest meaningful flood exposure, so resilience upgrades and emergency readiness should be prioritized.",
    summary: "Recommended focus: strengthen flood defenses, improve evacuation communication, and review zoning before new development."
  },
  High: {
    className: "high-risk",
    explanation: "High vulnerability. Low elevation, repeated flooding, or close coastal proximity point to a strong need for protective action and response planning.",
    summary: "Recommended focus: prioritize protective infrastructure, relocation planning for the most exposed assets, and detailed emergency drills."
  }
};

function setFieldError(fieldConfig, message) {
  fieldConfig.error.textContent = message;
  fieldConfig.input.classList.toggle("is-invalid", Boolean(message));
  fieldConfig.input.setAttribute("aria-invalid", message ? "true" : "false");
}

function validateField(fieldConfig) {
  const rawValue = fieldConfig.input.value.trim();

  if (!rawValue) {
    setFieldError(fieldConfig, `${fieldConfig.label} is required.`);
    return null;
  }

  const numericValue = Number(rawValue);

  if (Number.isNaN(numericValue)) {
    setFieldError(fieldConfig, `${fieldConfig.label} must be a valid number.`);
    return null;
  }

  if (numericValue < fieldConfig.min || numericValue > fieldConfig.max) {
    setFieldError(
      fieldConfig,
      `${fieldConfig.label} must be between ${fieldConfig.min} and ${fieldConfig.max}.`
    );
    return null;
  }

  setFieldError(fieldConfig, "");
  return numericValue;
}

function getRiskLevel(elevation, distance, floods) {
  let score = 0;

  if (elevation <= 1) {
    score += 4;
  } else if (elevation <= 3) {
    score += 2;
  }

  if (distance <= 2) {
    score += 4;
  } else if (distance <= 5) {
    score += 2;
  }

  if (floods >= 5) {
    score += 4;
  } else if (floods >= 2) {
    score += 2;
  }

  if (score >= 8) {
    return "High";
  }

  if (score >= 4) {
    return "Medium";
  }

  return "Low";
}

function renderPredictorResult(riskLevel, values) {
  const resultCopy = resultContentByRisk[riskLevel];

  predictorResult.className = `predictor-result ${resultCopy.className}`;
  predictorResult.innerHTML = `
    <h5>${riskLevel} Risk</h5>
    <p>${resultCopy.explanation}</p>
    <p class="risk-summary">Inputs assessed: ${values.elevation} m elevation, ${values.distance} km from coast, ${values.floods} flood event(s) per year.</p>
    <p class="risk-summary">${resultCopy.summary}</p>
  `;
}

Object.values(predictorFields).forEach((fieldConfig) => {
  fieldConfig.input.addEventListener("input", () => {
    if (fieldConfig.error.textContent) {
      validateField(fieldConfig);
    }
  });
});

riskPredictorForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const elevation = validateField(predictorFields.elevation);
  const distance = validateField(predictorFields.distance);
  const floods = validateField(predictorFields.floods);

  if ([elevation, distance, floods].some((value) => value === null)) {
    predictorResult.className = "predictor-result";
    predictorResult.innerHTML = "<p class=\"predictor-placeholder\">Please correct the highlighted fields to calculate coastal risk.</p>";
    return;
  }

  const riskLevel = getRiskLevel(elevation, distance, floods);
  renderPredictorResult(riskLevel, { elevation, distance, floods });
});
