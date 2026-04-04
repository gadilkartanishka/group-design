import { useState } from "react";

const locationData = {
  Maharashtra: {
    Mumbai: {
      wind: "44 m/sec",
      seismic: "Zone III, 0.16",
      temperature: "22°C to 38°C",
    },
    Pune: {
      wind: "39 m/sec",
      seismic: "Zone III, 0.16",
      temperature: "18°C to 36°C",
    },
  },
  Karnataka: {
    Bengaluru: {
      wind: "33 m/sec",
      seismic: "Zone II, 0.10",
      temperature: "19°C to 34°C",
    },
  },
  Delhi: {
    "Central Delhi": {
      wind: "47 m/sec",
      seismic: "Zone IV, 0.24",
      temperature: "7°C to 43°C",
    },
  },
};

function ProjectLocationPanel({
  locationMode,
  setLocationMode,
  selectedState,
  setSelectedState,
  selectedDistrict,
  setSelectedDistrict,
  showCustomModal,
  setShowCustomModal,
  customLoadingValues,
  setCustomLoadingValues,
}) {
  const [showStateMenu, setShowStateMenu] = useState(false);
  const [showDistrictMenu, setShowDistrictMenu] = useState(false);
  const [draftValues, setDraftValues] = useState(customLoadingValues);

  const states = Object.keys(locationData);
  const districts = selectedState
    ? Object.keys(locationData[selectedState])
    : [];

  const result =
    locationMode === "location" && selectedState && selectedDistrict
      ? locationData[selectedState][selectedDistrict]
      : null;

  const hasCustomValues =
    customLoadingValues.wind ||
    customLoadingValues.seismicZone ||
    customLoadingValues.zoneFactor ||
    customLoadingValues.maxTemp ||
    customLoadingValues.minTemp;

  const handleStateSelect = (state) => {
    setSelectedState(state);
    setSelectedDistrict("");
    setShowStateMenu(false);
    setShowDistrictMenu(false);
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
    setShowDistrictMenu(false);
  };

  const openCustomModal = () => {
    setLocationMode("custom");
    setDraftValues(customLoadingValues);
    setShowCustomModal(true);
  };

  const saveCustomValues = () => {
    setCustomLoadingValues(draftValues);
    setShowCustomModal(false);
  };

  return (
    <section className="reference-panel">
      <div className="reference-banner">
        PROJECT LOCATION <span>(Basic inputs)</span>
      </div>

      <div className="reference-body project-location-body">
        <div className="project-location-card">
          <div className="project-location-row">
            <button
              type="button"
              className="project-option project-option-button"
              onClick={() => setLocationMode("location")}
            >
              <span className="project-bullet" aria-hidden="true" />
              <span>Enter Location Name</span>
            </button>

            <div className="project-select-group">
              <span>State</span>

              <div className="project-dropdown-box">
                <button
                  type="button"
                  className="project-dropdown-trigger"
                  onClick={() => {
                    if (locationMode !== "location") return;
                    setShowStateMenu((prev) => !prev);
                    setShowDistrictMenu(false);
                  }}
                  disabled={locationMode !== "location"}
                >
                  <span>{selectedState || ""}</span>
                  <span className="dropdown-icon" aria-hidden="true" />
                </button>

                {showStateMenu && (
                  <div className="project-dropdown-menu">
                    {states.map((state) => (
                      <button
                        key={state}
                        type="button"
                        className="project-dropdown-item"
                        onClick={() => handleStateSelect(state)}
                      >
                        {state}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="project-select-group">
              <span>District</span>

              <div className="project-dropdown-box">
                <button
                  type="button"
                  className="project-dropdown-trigger"
                  onClick={() => {
                    if (locationMode !== "location" || !selectedState) return;
                    setShowDistrictMenu((prev) => !prev);
                    setShowStateMenu(false);
                  }}
                  disabled={locationMode !== "location" || !selectedState}
                >
                  <span>{selectedDistrict || ""}</span>
                  <span className="dropdown-icon" aria-hidden="true" />
                </button>

                {showDistrictMenu && (
                  <div className="project-dropdown-menu">
                    {districts.map((district) => (
                      <button
                        key={district}
                        type="button"
                        className="project-dropdown-item"
                        onClick={() => handleDistrictSelect(district)}
                      >
                        {district}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {locationMode === "location" && result && (
            <div className="project-result-box">
              <p>IRC 6 (2017) Resulting Values:</p>
              <p>Basic Wind Speed: {result.wind}</p>
              <p>Seismic Zone and Zone Factor: {result.seismic}</p>
              <p>Shade Air Temperature: {result.temperature}</p>
            </div>
          )}

          {locationMode === "custom" && hasCustomValues && (
            <div className="project-result-box">
              <p>Custom Loading Values:</p>
              <p>Basic Wind Speed: {customLoadingValues.wind}</p>
              <p>
                Seismic Zone and Zone Factor: {customLoadingValues.seismicZone},{" "}
                {customLoadingValues.zoneFactor}
              </p>
              <p>
                Shade Air Temperature: {customLoadingValues.minTemp}°C to{" "}
                {customLoadingValues.maxTemp}°C
              </p>
            </div>
          )}

          <button
            type="button"
            className="project-option project-option-button"
            onClick={openCustomModal}
          >
            <span className="project-bullet" aria-hidden="true" />
            <span>Tabulate Custom Loading Parameters</span>
          </button>
        </div>

        {showCustomModal && (
          <div className="custom-modal-overlay">
            <div className="custom-modal">
              <h3>Custom Loading Parameters</h3>

              <div className="custom-modal-grid">
                <label>
                  Basic Wind Speed
                  <input
                    type="text"
                    value={draftValues.wind}
                    onChange={(event) =>
                      setDraftValues({
                        ...draftValues,
                        wind: event.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Seismic Zone
                  <input
                    type="text"
                    value={draftValues.seismicZone}
                    onChange={(event) =>
                      setDraftValues({
                        ...draftValues,
                        seismicZone: event.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Zone Factor
                  <input
                    type="text"
                    value={draftValues.zoneFactor}
                    onChange={(event) =>
                      setDraftValues({
                        ...draftValues,
                        zoneFactor: event.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Max Shade Air Temperature
                  <input
                    type="text"
                    value={draftValues.maxTemp}
                    onChange={(event) =>
                      setDraftValues({
                        ...draftValues,
                        maxTemp: event.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Min Shade Air Temperature
                  <input
                    type="text"
                    value={draftValues.minTemp}
                    onChange={(event) =>
                      setDraftValues({
                        ...draftValues,
                        minTemp: event.target.value,
                      })
                    }
                  />
                </label>
              </div>

              <div className="custom-modal-actions">
                <button type="button" onClick={() => setShowCustomModal(false)}>
                  Cancel
                </button>
                <button type="button" onClick={saveCustomValues}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProjectLocationPanel;
