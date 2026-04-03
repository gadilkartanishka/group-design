function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="tabs">
        <button className="tab tab-active" type="button">Basic Inputs</button>
        <button className="tab" type="button">Additional Inputs</button>
      </div>

      <div className="panel-box type-box">
        <span>Type of Structure</span>
        <span className="dropdown-icon" aria-hidden="true" />
      </div>

      <div className="panel-box panel-box-highlight">
        <h2>Project Location</h2>
      </div>

      <div className="panel-box geometry-box">
        <header className="panel-box-header">
          <h2>Geometric Details</h2>
          <button type="button" className="mini-button">
            Modify<br />Additional<br />Geometry
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

      <div className="panel-box material-box">
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