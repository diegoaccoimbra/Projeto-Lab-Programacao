import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PortalPaciente from "./pages/PortalPaciente";
import PainelProfissional from "./pages/PainelProfissional";

function App() {
  return (
    <Router>
      <Routes>
        <Route path = "/" element = {<LoginPage/>} />
        <Route path = "/paciente" element = {<PortalPaciente/>} />
        <Route path = "/profissional" element = {<PainelProfissional/>} />
      </Routes>
    </Router>
  );
}

export default App;
