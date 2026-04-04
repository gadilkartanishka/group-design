function ProjectLocationPanel() {
  return (
    <section className="reference-panel">
      <div className="reference-banner">
        PROJECT LOCATION <span>(Basic inputs)</span>
      </div>

      <div className="reference-body project-location-body">
        <div className="project-location-card">
          <div className="project-location-row">
            <div className="project-option">
              <span className="project-bullet" aria-hidden="true" />
              <span>Enter Location Name</span>
            </div>

            <div className="project-select-group">
              <span>State</span>
              <span className="dropdown-icon" aria-hidden="true" />
            </div>

            <div className="project-select-group">
              <span>District</span>
              <span className="dropdown-icon" aria-hidden="true" />
            </div>
          </div>

          <div className="project-result-box">
            <p>IRC 6 (2017) Resulting Values:</p>
            <p>Basic Wind Speed (m/sec)</p>
            <p>Seismic Zone and Zone Factor</p>
            <p>Shade Air Temperature (°C)</p>
          </div>

          <div className="project-option">
            <span className="project-bullet" aria-hidden="true" />
            <span>Tabulate Custom Loading Parameters</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProjectLocationPanel;
