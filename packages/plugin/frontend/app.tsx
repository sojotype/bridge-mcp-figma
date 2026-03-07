import { Activity } from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { HistoryNavigator } from "./components/history-navigator";
import Footer from "./components/layout/footer";
import Header from "./components/layout/header";
import AboutScreen from "./components/screens/about";
import ErrorScreen from "./components/screens/error";
import MCPScreen from "./components/screens/mcp";
import MiniScreen from "./components/screens/mini";
import SessionScreen from "./components/screens/session";
import WarningScreen from "./components/screens/warning";
import WSScreen from "./components/screens/ws";

export const App = () => {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <HistoryNavigator />
      <Routes>
        <Route element={<ErrorLayout error={null} />} path="/error" />
        <Route element={<WarningLayout />} path="/warning" />
        <Route element={<MainLayout />} path="*" />
      </Routes>
    </MemoryRouter>
  );
};

function ErrorLayout({ error }: { error: string | null }) {
  return <ErrorScreen error={error} />;
}

function WarningLayout() {
  return <WarningScreen />;
}

function MainLayout() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="flex flex-col bg-neutral-4 font-sans">
      {/* Header */}
      <Header />
      {/* Screens */}
      <Activity mode={pathname === "/" ? "visible" : "hidden"}>
        <MCPScreen />
      </Activity>
      <Activity mode={pathname === "/session" ? "visible" : "hidden"}>
        <SessionScreen />
      </Activity>
      <Activity mode={pathname === "/ws" ? "visible" : "hidden"}>
        <WSScreen />
      </Activity>
      {pathname === "/about" && <AboutScreen />}
      {pathname === "/mini" && <MiniScreen />}
      {/* Footer */}
      <Footer />
    </div>
  );
}
