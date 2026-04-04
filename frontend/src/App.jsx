import { useState } from "react";
import "./App.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ReferencePanel from "./components/ReferencePanel";
import ProjectLocationPanel from "./components/ProjectLocationPanel";

function App() {
  const [structureType, setStructureType] = useState("");
  const [activePanel, setActivePanel] = useState("reference");

  return (
    <main className="app-shell">
      <section className="workspace">
        <Header />

        <div className="workspace-body">
          <Sidebar
            structureType={structureType}
            setStructureType={setStructureType}
            activePanel={activePanel}
            setActivePanel={setActivePanel}
          />

          {activePanel === "project-location" ? (
            <ProjectLocationPanel />
          ) : (
            <ReferencePanel />
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
