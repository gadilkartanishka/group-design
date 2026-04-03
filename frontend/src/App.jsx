import "./App.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <main className="app-shell">
      <section className="workspace">
        <Header />
        <Sidebar />
      </section>
    </main>
  );
}

export default App;