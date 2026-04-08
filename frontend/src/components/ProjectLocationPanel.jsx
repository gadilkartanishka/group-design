import { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api";

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
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [result, setResult] = useState(null);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingResult, setIsLoadingResult] = useState(false);
  const [apiError, setApiError] = useState("");

  const hasCustomValues =
    customLoadingValues.wind ||
    customLoadingValues.seismicZone ||
    customLoadingValues.zoneFactor ||
    customLoadingValues.maxTemp ||
    customLoadingValues.minTemp;

  useEffect(() => {
    const fetchStates = async () => {
      setIsLoadingStates(true);
      setApiError("");

      try {
        const response = await fetch(`${API_BASE}/locations/states/`);
        if (!response.ok) {
          throw new Error("Failed to fetch states.");
        }

        const data = await response.json();
        setStates(data.states || []);
      } catch (error) {
        setApiError("Could not load states from backend.");
      } finally {
        setIsLoadingStates(false);
      }
    };

    fetchStates();
  }, []);

  useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      setSelectedDistrict("");
      setResult(null);
      return;
    }

    const fetchDistricts = async () => {
      setIsLoadingDistricts(true);
      setApiError("");

      try {
        const response = await fetch(
          `${API_BASE}/locations/districts/?state=${encodeURIComponent(
            selectedState
          )}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch districts.");
        }

        const data = await response.json();
        setDistricts(data.districts || []);
      } catch (error) {
        setApiError("Could not load districts from backend.");
      } finally {
        setIsLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, [selectedState, setSelectedDistrict]);

  useEffect(() => {
    if (locationMode !== "location" || !selectedState || !selectedDistrict) {
      setResult(null);
      return;
    }

    const fetchResult = async () => {
      setIsLoadingResult(true);
      setApiError("");

      try {
        const response = await fetch(
          `${API_BASE}/locations/result/?state=${encodeURIComponent(
            selectedState
          )}&district=${encodeURIComponent(selectedDistrict)}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch result values.");
        }

        const data = await response.json();
        setResult(data.result || null);
      } catch (error) {
        setApiError("Could not load location result values from backend.");
      } finally {
        setIsLoadingResult(false);
      }
    };

    fetchResult();
  }, [locationMode, selectedState, selectedDistrict]);

  const handleStateSelect = (state) => {
    setSelectedState(state);
    setSelectedDistrict("");
    setResult(null);
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

  const saveCustomValues = async () => {
    setApiError("");

    try {
      const response = await fetch(`${API_BASE}/locations/custom-loading/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wind: draftValues.wind,
          seismic_zone: draftValues.seismicZone,
          zone_factor: draftValues.zoneFactor,
          min_temp: draftValues.minTemp,
          max_temp: draftValues.maxTemp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to save custom loading values.");
      }

      setCustomLoadingValues({
        wind: data.result.wind,
        seismicZone: data.result.seismic_zone,
        zoneFactor: data.result.zone_factor,
        minTemp: data.result.min_temp,
        maxTemp: data.result.max_temp,
      });
      setShowCustomModal(false);
    } catch (error) {
      setApiError("Could not save custom loading values to backend.");
    }
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
                  disabled={locationMode !== "location" || isLoadingStates}
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
                  disabled={
                    locationMode !== "location" ||
                    !selectedState ||
                    isLoadingDistricts
                  }
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

          {apiError && <p className="field-error project-api-error">{apiError}</p>}

          {locationMode === "location" && isLoadingResult && (
            <div className="project-result-box">
              <p>Loading result values...</p>
            </div>
          )}

          {locationMode === "location" && result && (
            <div className="project-result-box">
              <p>IRC 6 (2017) Resulting Values:</p>
              <p>Basic Wind Speed: {result.wind}</p>
              <p>
                Seismic Zone and Zone Factor: {result.seismic_zone},{" "}
                {result.zone_factor}
              </p>
              <p>Minimum Shade Air Temperature: {result.min_temp}</p>
              <p>Maximum Shade Air Temperature: {result.max_temp}</p>
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
              <p>Minimum Shade Air Temperature: {customLoadingValues.minTemp}</p>
              <p>Maximum Shade Air Temperature: {customLoadingValues.maxTemp}</p>
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
            <div className="custom-modal custom-modal-table">
              <h3>Custom Loading Parameters</h3>

              <div className="custom-loading-sheet">
                <div className="custom-loading-row">
                  <span>Basic Wind Speed</span>
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
                </div>

                <div className="custom-loading-row">
                  <span>Seismic Zone</span>
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
                </div>

                <div className="custom-loading-row">
                  <span>Zone Factor</span>
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
                </div>

                <div className="custom-loading-row">
                  <span>Max Shade Air Temperature</span>
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
                </div>

                <div className="custom-loading-row">
                  <span>Min Shade Air Temperature</span>
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
                </div>
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
