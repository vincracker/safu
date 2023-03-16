import "./App.css";
import { createContext, useContext, useReducer } from "react";

import { Route, Routes, useLocation } from "react-router-dom";

import AppNav from "./components/Navbar/AppNav";
import Navbar from "./components/Navbar/HomeNav";
import About from "./pages/about";
import Faq from "./pages/faq";
import Guide from "./pages/guide";
import Home from "./pages/home";
import OTC from "./pages/otc";
import SRfund from "./pages/srfund";
import Term from "./pages/term";
import { initailState, reducer, IState } from "./utils/contextAPI";

interface IContextProps {
  state: IState;
  dispatch: ({ type }: { type: string; payload?: any }) => void;
}

export const AppContext = createContext({} as IContextProps);
export const UseAppContext = () => useContext(AppContext);

function App() {
  const [state, dispatch] = useReducer(reducer, initailState);
  const { pathname } = useLocation();
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <main>
        {pathname.includes("app") ? <AppNav /> : <Navbar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/app" element={<SRfund />} />
          <Route path="/app/otc" element={<OTC />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/term" element={<Term />} />
        </Routes>
      </main>
    </AppContext.Provider>
  );
}

export default App;
