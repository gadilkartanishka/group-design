import { useState } from "react";

function Sidebar({ structureType, setStructureType }) {
  const [showStructureMenu, setShowStructureMenu] = useState(false);
  const isOther = structureType === "Other";

  const handleStructureSelect = (value) => {
    setStructureType(value);
    setShowStructureMenu(false);
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

      <div
        className={`panel-box panel-box-highlight ${isOther ? "panel-disabled" : ""}`}
      >
        <h2>Project Location</h2>
      </div>

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

        <ul className="field-list">
          <li className="field-item">Span (m):</li>
          <li className="field-item">Carriageway Width (m):</li>
          <li className="field-item field-item-dropdown">
            Footpath
            <span className="dropdown-icon" aria-hidden="true" />
          </li>
          <li className="field-item">Skew Angle (degrees):</li>
        </ul>
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
