import { useState } from "react";
import "./App.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ReferencePanel from "./components/ReferencePanel";

function App() {
  const [structureType, setStructureType] = useState("");
  return (
    <main className="app-shell">
      <section className="workspace">
        <Header />

        <div className="workspace-body">
          <Sidebar
            structureType={structureType}
            setStructureType={setStructureType}
          />
          <ReferencePanel />
        </div>
      </section>
    </main>
  );
}

export default App;
