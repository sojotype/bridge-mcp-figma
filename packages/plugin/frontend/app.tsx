import { useEffect } from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import Footer from "./components/layout/footer";
import Header from "./components/layout/header";
import AboutScreen from "./components/screens/about";
import ErrorScreen from "./components/screens/error";
import MCPScreen from "./components/screens/mcp";
import MiniScreen from "./components/screens/mini";
import SessionScreen from "./components/screens/session";
import WarningScreen from "./components/screens/warning";
import WebSocketScreen from "./components/screens/websocket";
import { FitContainer } from "./components/utils/fit-container";
import { HistoryNavigator } from "./components/utils/history-navigator";
import { RoutePersistence } from "./components/utils/route-persistence";
import { frontendBroker } from "./lib/frontend-broker";
import type { ROUTES } from "./routes";
import { useSettings } from "./stores/settings";

export const App = () => {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <HistoryNavigator />
      <RoutePersistence />
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
  const route = useLocation().pathname as keyof typeof ROUTES;
  useSettings();

  useEffect(() => {
    frontendBroker.post("ready");
  }, []);

  return (
    <FitContainer className="flex h-full flex-col overflow-hidden bg-neutral-4 font-sans">
      {/* Header */}
      <Header route={route} />
      {/* Screens */}
      <MCPScreen route={route} />
      <WebSocketScreen route={route} />
      <SessionScreen route={route} />
      <AboutScreen route={route} />
      <MiniScreen route={route} />
      {/* Footer */}
      <Footer route={route} />
    </FitContainer>
  );
}
