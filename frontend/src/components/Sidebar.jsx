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
}) {
  const [showStructureMenu, setShowStructureMenu] = useState(false);
  const [showFootpathMenu, setShowFootpathMenu] = useState(false);

  const isOther = structureType === "Other";

  const spanNumber = Number(span);
  const carriagewayNumber = Number(carriagewayWidth);
  const skewAngleNumber = Number(skewAngle);

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

  const handleStructureSelect = (value) => {
    setStructureType(value);
    setShowStructureMenu(false);
  };

  const handleFootpathSelect = (value) => {
    setFootpath(value);
    setShowFootpathMenu(false);
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
          <button type="button" className="mini-button" disabled={isOther}>
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

        <ul className="field-list">
          <li className="field-item field-item-dropdown">
            Girder
            <span className="dropdown-icon" aria-hidden="true" />
          </li>
          <li className="field-item field-item-dropdown">
            Cross Bracing
            <span className="dropdown-icon" aria-hidden="true" />
          </li>
          <li className="field-item field-item-dropdown">
            Deck
            <span className="dropdown-icon" aria-hidden="true" />
          </li>
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
