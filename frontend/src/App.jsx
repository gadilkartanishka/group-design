import { useState } from "react";
import "./App.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ReferencePanel from "./components/ReferencePanel";
import ProjectLocationPanel from "./components/ProjectLocationPanel";

function App() {
  const [structureType, setStructureType] = useState("");
  const [activePanel, setActivePanel] = useState("reference");

  const [locationMode, setLocationMode] = useState("location");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customLoadingValues, setCustomLoadingValues] = useState({
    wind: "",
    seismicZone: "",
    zoneFactor: "",
    maxTemp: "",
    minTemp: "",
  });

  const [span, setSpan] = useState("");
  const [carriagewayWidth, setCarriagewayWidth] = useState("");
  const [footpath, setFootpath] = useState("");
  const [skewAngle, setSkewAngle] = useState("");
  const [showGeometryModal, setShowGeometryModal] = useState(false);
  const [girderSpacing, setGirderSpacing] = useState("");
  const [numberOfGirders, setNumberOfGirders] = useState("");
  const [deckOverhangWidth, setDeckOverhangWidth] = useState("");
  const [girderGrade, setGirderGrade] = useState("");
  const [crossBracingGrade, setCrossBracingGrade] = useState("");
  const [deckGrade, setDeckGrade] = useState("");

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
            span={span}
            setSpan={setSpan}
            carriagewayWidth={carriagewayWidth}
            setCarriagewayWidth={setCarriagewayWidth}
            footpath={footpath}
            setFootpath={setFootpath}
            skewAngle={skewAngle}
            setSkewAngle={setSkewAngle}
            showGeometryModal={showGeometryModal}
            setShowGeometryModal={setShowGeometryModal}
            girderSpacing={girderSpacing}
            setGirderSpacing={setGirderSpacing}
            numberOfGirders={numberOfGirders}
            setNumberOfGirders={setNumberOfGirders}
            deckOverhangWidth={deckOverhangWidth}
            setDeckOverhangWidth={setDeckOverhangWidth}
            girderGrade={girderGrade}
            setGirderGrade={setGirderGrade}
            crossBracingGrade={crossBracingGrade}
            setCrossBracingGrade={setCrossBracingGrade}
            deckGrade={deckGrade}
            setDeckGrade={setDeckGrade}
          />

          {activePanel === "project-location" ? (
            <ProjectLocationPanel
              locationMode={locationMode}
              setLocationMode={setLocationMode}
              selectedState={selectedState}
              setSelectedState={setSelectedState}
              selectedDistrict={selectedDistrict}
              setSelectedDistrict={setSelectedDistrict}
              showCustomModal={showCustomModal}
              setShowCustomModal={setShowCustomModal}
              customLoadingValues={customLoadingValues}
              setCustomLoadingValues={setCustomLoadingValues}
            />
          ) : (
            <ReferencePanel />
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
