import "./App.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ReferencePanel from "./components/ReferencePanel";

function App() {
  return (
    <main className="app-shell">
      <section className="workspace">
        <Header />

        <div className="workspace-body">
          <Sidebar />
          <ReferencePanel />
        </div>
      </section>
    </main>
  );
}

export default App;
