import { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api";

function Sidebar({
  structureType,
  setStructureType,
  activePanel,
  setActivePanel,
  span,
  setSpan,
  carriagewayWidth,
  setCarriagewayWidth,
  footpath,
  setFootpath,
  skewAngle,
  setSkewAngle,
  showGeometryModal,
  setShowGeometryModal,
  girderSpacing,
  setGirderSpacing,
  numberOfGirders,
  setNumberOfGirders,
  deckOverhangWidth,
  setDeckOverhangWidth,
  girderGrade,
  setGirderGrade,
  crossBracingGrade,
  setCrossBracingGrade,
  deckGrade,
  setDeckGrade,
  basicInputOptions,
  basicOptionsError,
}) {
  const [showStructureMenu, setShowStructureMenu] = useState(false);
  const [showFootpathMenu, setShowFootpathMenu] = useState(false);
  const [showGirderMenu, setShowGirderMenu] = useState(false);
  const [showCrossBracingMenu, setShowCrossBracingMenu] = useState(false);
  const [showDeckMenu, setShowDeckMenu] = useState(false);
  const [lastGeometryDriver, setLastGeometryDriver] = useState("spacing");
  const [geometryErrors, setGeometryErrors] = useState({});
  const [geometryApiError, setGeometryApiError] = useState("");
  const [geometryModalError, setGeometryModalError] = useState("");
  const [overallBridgeWidth, setOverallBridgeWidth] = useState(0);

  const isOther = structureType === "Other";
  const structureTypes = basicInputOptions.structure_types || [];
  const footpathOptions = basicInputOptions.footpath_options || [];
  const materialOptions = basicInputOptions.material_options || {
    girder: [],
    cross_bracing: [],
    deck: [],
  };

  useEffect(() => {
    const validateGeometry = async () => {
      if (isOther) {
        setGeometryErrors({});
        setGeometryApiError("");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/geometry/validate/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            span,
            carriageway_width: carriagewayWidth,
            footpath,
            skew_angle: skewAngle,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to validate geometry inputs.");
        }

        const data = await response.json();
        setGeometryErrors(data.errors || {});
        setGeometryApiError("");
      } catch (error) {
        setGeometryApiError("Could not validate geometric details from backend.");
      }
    };

    validateGeometry();
  }, [span, carriagewayWidth, footpath, skewAngle, isOther]);

  useEffect(() => {
    if (!showGeometryModal) {
      setGeometryModalError("");
      return;
    }

    if (carriagewayWidth === "") {
      setOverallBridgeWidth(0);
      return;
    }

    setOverallBridgeWidth(Number(carriagewayWidth) + 5);
  }, [showGeometryModal, carriagewayWidth]);

  const handleStructureSelect = (value) => {
    setStructureType(value);
    setShowStructureMenu(false);
  };

  const handleFootpathSelect = (value) => {
    setFootpath(value);
    setShowFootpathMenu(false);
  };

  const handleGirderSelect = (value) => {
    setGirderGrade(value);
    setShowGirderMenu(false);
  };

  const handleCrossBracingSelect = (value) => {
    setCrossBracingGrade(value);
    setShowCrossBracingMenu(false);
  };

  const handleDeckSelect = (value) => {
    setDeckGrade(value);
    setShowDeckMenu(false);
  };

  const syncAdditionalGeometry = async ({
    nextSpacing = girderSpacing,
    nextGirders = numberOfGirders,
    nextOverhang = deckOverhangWidth,
    driver = "",
  }) => {
    if (carriagewayWidth === "") {
      setOverallBridgeWidth(0);
      setGeometryModalError("Enter carriageway width first.");
      if (driver === "spacing") {
        setGirderSpacing(nextSpacing);
      } else if (driver === "girders") {
        setNumberOfGirders(nextGirders);
      } else if (driver === "overhang") {
        setDeckOverhangWidth(nextOverhang);
      }
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/geometry/additional/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carriageway_width: carriagewayWidth,
          girder_spacing: nextSpacing,
          number_of_girders: nextGirders,
          deck_overhang_width: nextOverhang,
          driver,
        }),
      });

      const data = await response.json();
      const width =
        data.result?.overall_bridge_width ?? data.overall_bridge_width ?? 0;
      setOverallBridgeWidth(width);

      if (!response.ok) {
        setGeometryModalError(
          data.errors?.formula ||
            data.errors?.girder_spacing ||
            data.errors?.deck_overhang_width ||
            data.detail ||
            "Could not calculate additional geometry."
        );

        if (driver === "spacing") {
          setGirderSpacing(nextSpacing);
        } else if (driver === "girders") {
          setNumberOfGirders(nextGirders);
        } else if (driver === "overhang") {
          setDeckOverhangWidth(nextOverhang);
        }
        return;
      }

      setGeometryModalError("");
      setGirderSpacing(
        data.result.girder_spacing === null || data.result.girder_spacing === ""
          ? ""
          : String(data.result.girder_spacing)
      );
      setNumberOfGirders(
        data.result.number_of_girders === null ||
          data.result.number_of_girders === ""
          ? ""
          : String(data.result.number_of_girders)
      );
      setDeckOverhangWidth(
        data.result.deck_overhang_width === null ||
          data.result.deck_overhang_width === ""
          ? ""
          : String(data.result.deck_overhang_width)
      );
    } catch (error) {
      setGeometryModalError("Could not calculate additional geometry from backend.");
    }
  };

  const handleSpacingChange = (event) => {
    const value = event.target.value;
    setLastGeometryDriver("spacing");
    syncAdditionalGeometry({
      nextSpacing: value,
      driver: "spacing",
    });
  };

  const handleGirdersChange = (event) => {
    const value = event.target.value;
    setLastGeometryDriver("girders");
    syncAdditionalGeometry({
      nextGirders: value,
      driver: "girders",
    });
  };

  const handleOverhangChange = (event) => {
    const value = event.target.value;
    setLastGeometryDriver("overhang");
    syncAdditionalGeometry({
      nextSpacing: lastGeometryDriver === "spacing" ? girderSpacing : "",
      nextGirders: lastGeometryDriver === "girders" ? numberOfGirders : "",
      nextOverhang: value,
      driver: "overhang",
    });
  };

  return (
    <aside className="sidebar">
      <div className="tabs">
        <button className="tab tab-active" type="button">
          Basic Inputs
        </button>
        <button className="tab" type="button">
          Additional Inputs
        </button>
      </div>

      <div className="panel-box type-box">
        <button
          type="button"
          className="type-trigger"
          onClick={() => setShowStructureMenu((prev) => !prev)}
        >
          <span>{structureType || "Type of Structure"}</span>
          <span className="dropdown-icon" aria-hidden="true" />
        </button>

        {showStructureMenu && (
          <div className="type-menu">
            {structureTypes.map((option) => (
              <button
                key={option}
                type="button"
                className="type-menu-item"
                onClick={() => handleStructureSelect(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      {isOther && (
        <p className="structure-message">Other structures not included.</p>
      )}

      <button
        type="button"
        className={`panel-box panel-box-highlight panel-box-button ${
          isOther ? "panel-disabled" : ""
        } ${activePanel === "project-location" ? "panel-box-active" : ""}`}
        onClick={() => setActivePanel("project-location")}
        disabled={isOther}
      >
        <h2>Project Location</h2>
      </button>

      <div
        className={`panel-box geometry-box ${isOther ? "panel-disabled" : ""}`}
      >
        <header className="panel-box-header">
          <h2>Geometric Details</h2>
          <button
            type="button"
            className="mini-button"
            disabled={isOther}
            onClick={() => setShowGeometryModal(true)}
          >
            Modify
            <br />
            Additional
            <br />
            Geometry
          </button>
        </header>

        <div className="geometry-fields">
          <div className="geometry-field">
            <label htmlFor="span-input">Span (m):</label>
            <input
              id="span-input"
              type="number"
              value={span}
              onChange={(event) => setSpan(event.target.value)}
              disabled={isOther}
            />
            {geometryErrors.span && (
              <p className="field-error">{geometryErrors.span}</p>
            )}
          </div>

          <div className="geometry-field">
            <label htmlFor="carriageway-width-input">
              Carriageway Width (m):
            </label>
            <input
              id="carriageway-width-input"
              type="number"
              value={carriagewayWidth}
              onChange={(event) => setCarriagewayWidth(event.target.value)}
              disabled={isOther}
            />
            {geometryErrors.carriageway_width && (
              <p className="field-error">{geometryErrors.carriageway_width}</p>
            )}
          </div>

          <div className="geometry-field">
            <label>Footpath</label>

            <div className="project-dropdown-box">
              <button
                type="button"
                className="project-dropdown-trigger"
                onClick={() => setShowFootpathMenu((prev) => !prev)}
                disabled={isOther}
              >
                <span>{footpath || ""}</span>
                <span className="dropdown-icon" aria-hidden="true" />
              </button>

              {showFootpathMenu && (
                <div className="project-dropdown-menu">
                  {footpathOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className="project-dropdown-item"
                      onClick={() => handleFootpathSelect(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="geometry-field">
            <label htmlFor="skew-angle-input">Skew Angle (degrees):</label>
            <input
              id="skew-angle-input"
              type="number"
              value={skewAngle}
              onChange={(event) => setSkewAngle(event.target.value)}
              disabled={isOther}
            />
            {geometryErrors.skew_angle && (
              <p className="field-error">{geometryErrors.skew_angle}</p>
            )}
          </div>
        </div>

        {geometryApiError && (
          <p className="field-error sidebar-api-error">{geometryApiError}</p>
        )}
      </div>

      <div
        className={`panel-box material-box ${isOther ? "panel-disabled" : ""}`}
      >
        <h2>Material Inputs</h2>

        <div className="material-fields">
          <div className="material-field">
            <label>Girder</label>
            <div className="project-dropdown-box">
              <button
                type="button"
                className="project-dropdown-trigger"
                onClick={() => {
                  setShowGirderMenu((prev) => !prev);
                  setShowCrossBracingMenu(false);
                  setShowDeckMenu(false);
                }}
                disabled={isOther}
              >
                <span>{girderGrade || ""}</span>
                <span className="dropdown-icon" aria-hidden="true" />
              </button>

              {showGirderMenu && (
                <div className="project-dropdown-menu">
                  {materialOptions.girder.map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      className="project-dropdown-item"
                      onClick={() => handleGirderSelect(grade)}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="material-field">
            <label>Cross Bracing</label>
            <div className="project-dropdown-box">
              <button
                type="button"
                className="project-dropdown-trigger"
                onClick={() => {
                  setShowCrossBracingMenu((prev) => !prev);
                  setShowGirderMenu(false);
                  setShowDeckMenu(false);
                }}
                disabled={isOther}
              >
                <span>{crossBracingGrade || ""}</span>
                <span className="dropdown-icon" aria-hidden="true" />
              </button>

              {showCrossBracingMenu && (
                <div className="project-dropdown-menu">
                  {materialOptions.cross_bracing.map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      className="project-dropdown-item"
                      onClick={() => handleCrossBracingSelect(grade)}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="material-field">
            <label>Deck</label>
            <div className="project-dropdown-box">
              <button
                type="button"
                className="project-dropdown-trigger"
                onClick={() => {
                  setShowDeckMenu((prev) => !prev);
                  setShowGirderMenu(false);
                  setShowCrossBracingMenu(false);
                }}
                disabled={isOther}
              >
                <span>{deckGrade || ""}</span>
                <span className="dropdown-icon" aria-hidden="true" />
              </button>

              {showDeckMenu && (
                <div className="project-dropdown-menu">
                  {materialOptions.deck.map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      className="project-dropdown-item"
                      onClick={() => handleDeckSelect(grade)}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {basicOptionsError && (
          <p className="field-error sidebar-api-error">{basicOptionsError}</p>
        )}
      </div>

      {showGeometryModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal geometry-modal">
            <h3>Modify Additional Geometry</h3>

            <p className="geometry-modal-meta">
              Overall Bridge Width = Carriageway Width + 5 ={" "}
              {overallBridgeWidth > 0 ? overallBridgeWidth.toFixed(2) : "--"} m
            </p>

            <div className="custom-modal-grid geometry-modal-grid">
              <label>
                Girder Spacing (m)
                <input
                  type="number"
                  step="0.1"
                  value={girderSpacing}
                  onChange={handleSpacingChange}
                />
              </label>

              <label>
                No. of Girders
                <input
                  type="number"
                  step="1"
                  value={numberOfGirders}
                  onChange={handleGirdersChange}
                />
              </label>

              <label>
                Deck Overhang Width (m)
                <input
                  type="number"
                  step="0.1"
                  value={deckOverhangWidth}
                  onChange={handleOverhangChange}
                />
              </label>
            </div>

            {geometryModalError && (
              <p className="field-error geometry-modal-error">
                {geometryModalError}
              </p>
            )}

            <div className="custom-modal-actions">
              <button type="button" onClick={() => setShowGeometryModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
