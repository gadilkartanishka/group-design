import { useState } from "react";

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
}) {
  const [showStructureMenu, setShowStructureMenu] = useState(false);
  const [showFootpathMenu, setShowFootpathMenu] = useState(false);
  const [showGirderMenu, setShowGirderMenu] = useState(false);
  const [showCrossBracingMenu, setShowCrossBracingMenu] = useState(false);
  const [showDeckMenu, setShowDeckMenu] = useState(false);

  const isOther = structureType === "Other";

  const spanNumber = Number(span);
  const carriagewayNumber = Number(carriagewayWidth);
  const skewAngleNumber = Number(skewAngle);
  const spacingNumber = Number(girderSpacing);
  const girdersNumber = Number(numberOfGirders);
  const overhangNumber = Number(deckOverhangWidth);
  const overallBridgeWidth =
    carriagewayWidth !== "" ? carriagewayNumber + 5 : 0;
  const spacingProvided = girderSpacing !== "";
  const girdersProvided = numberOfGirders !== "";
  const overhangProvided = deckOverhangWidth !== "";

  const spanError =
    span !== "" && (spanNumber < 20 || spanNumber > 45)
      ? "Outside the software range."
      : "";

  const carriagewayError =
    carriagewayWidth !== "" &&
    (carriagewayNumber < 4.25 || carriagewayNumber >= 24)
      ? "Width must be at least 4.25 m and less than 24 m."
      : "";

  const skewAngleError =
    skewAngle !== "" && (skewAngleNumber < -15 || skewAngleNumber > 15)
      ? "IRC 24 (2010) requires detailed analysis."
      : "";

  let geometryModalError = "";

  if (showGeometryModal && carriagewayWidth === "") {
    geometryModalError = "Enter carriageway width first.";
  } else if (spacingProvided && spacingNumber >= overallBridgeWidth) {
    geometryModalError = "Girder spacing must be less than overall bridge width.";
  } else if (overhangProvided && overhangNumber >= overallBridgeWidth) {
    geometryModalError =
      "Deck overhang width must be less than overall bridge width.";
  } else if (
    spacingProvided &&
    overhangProvided &&
    girdersProvided &&
    spacingNumber > 0
  ) {
    const expectedGirders = (overallBridgeWidth - overhangNumber) / spacingNumber;
    const integerGirders = Number.isInteger(expectedGirders);
    if (
      !Number.isFinite(expectedGirders) ||
      !integerGirders ||
      expectedGirders !== girdersNumber
    ) {
      geometryModalError =
        "Inputs must satisfy (Overall Width - Overhang) / Spacing = No. of Girders.";
    }
  }

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

  const syncFromSpacing = (spacingValue, overhangValue) => {
    const spacing = Number(spacingValue);
    const overhang = Number(overhangValue);

    if (
      !Number.isFinite(spacing) ||
      spacing <= 0 ||
      !Number.isFinite(overhang) ||
      overallBridgeWidth <= 0
    ) {
      return;
    }

    const calculatedGirders = (overallBridgeWidth - overhang) / spacing;
    if (Number.isFinite(calculatedGirders) && Number.isInteger(calculatedGirders)) {
      setNumberOfGirders(String(calculatedGirders));
    } else {
      setNumberOfGirders("");
    }
  };

  const syncFromGirders = (girdersValue, overhangValue) => {
    const girders = Number(girdersValue);
    const overhang = Number(overhangValue);

    if (
      !Number.isFinite(girders) ||
      girders <= 0 ||
      !Number.isFinite(overhang) ||
      overallBridgeWidth <= 0
    ) {
      return;
    }

    const calculatedSpacing = (overallBridgeWidth - overhang) / girders;
    if (Number.isFinite(calculatedSpacing) && calculatedSpacing > 0) {
      setGirderSpacing(calculatedSpacing.toFixed(1));
    } else {
      setGirderSpacing("");
    }
  };

  const handleSpacingChange = (event) => {
    const value = event.target.value;
    setGirderSpacing(value);
    syncFromSpacing(value, deckOverhangWidth);
  };

  const handleGirdersChange = (event) => {
    const value = event.target.value;
    setNumberOfGirders(value);
    syncFromGirders(value, deckOverhangWidth);
  };

  const handleOverhangChange = (event) => {
    const value = event.target.value;
    setDeckOverhangWidth(value);

    if (girdersProvided) {
      syncFromGirders(numberOfGirders, value);
    } else {
      syncFromSpacing(girderSpacing, value);
    }
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
            <button
              type="button"
              className="type-menu-item"
              onClick={() => handleStructureSelect("Highway")}
            >
              Highway
            </button>
            <button
              type="button"
              className="type-menu-item"
              onClick={() => handleStructureSelect("Other")}
            >
              Other
            </button>
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
            {spanError && <p className="field-error">{spanError}</p>}
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
            {carriagewayError && (
              <p className="field-error">{carriagewayError}</p>
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
                  <button
                    type="button"
                    className="project-dropdown-item"
                    onClick={() => handleFootpathSelect("Single-sided")}
                  >
                    Single-sided
                  </button>
                  <button
                    type="button"
                    className="project-dropdown-item"
                    onClick={() => handleFootpathSelect("Both")}
                  >
                    Both
                  </button>
                  <button
                    type="button"
                    className="project-dropdown-item"
                    onClick={() => handleFootpathSelect("None")}
                  >
                    None
                  </button>
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
            {skewAngleError && <p className="field-error">{skewAngleError}</p>}
          </div>
        </div>
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
                  {["E250", "E350", "E450"].map((grade) => (
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
                  {["E250", "E350", "E450"].map((grade) => (
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
                  {["M25", "M30", "M35", "M40", "M45", "M50", "M55", "M60"].map(
                    (grade) => (
                      <button
                        key={grade}
                        type="button"
                        className="project-dropdown-item"
                        onClick={() => handleDeckSelect(grade)}
                      >
                        {grade}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
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
              <p className="field-error geometry-modal-error">{geometryModalError}</p>
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
