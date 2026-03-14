import { useEffect } from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import Footer from "./components/layout/footer";
import Header from "./components/layout/header";
import AboutScreen from "./components/screens/about";
import ErrorScreen from "./components/screens/error";
import LoadingScreen from "./components/screens/loading";
import MiniScreen from "./components/screens/mini";
import SessionScreen from "./components/screens/session";
import { FitContainer } from "./components/utils/fit-container";
import { HistoryNavigator } from "./components/utils/history-navigator";
import { RoutePersistence } from "./components/utils/route-persistence";
import { ScreenSize } from "./components/utils/screen-size";
import { frontendBroker } from "./lib/frontend-broker";
import "./lib/ws-manager";
import DuplicatedScreen from "./components/screens/duplicated";
import SetupScreen from "./components/screens/setup";
import type { ROUTES } from "./routes";
import { useSettings } from "./stores/settings";

export const App = () => {
  useEffect(() => {
    frontendBroker.post("ready");
  }, []);

  return (
    <MemoryRouter initialEntries={["/loading"]}>
      <HistoryNavigator />
      <RoutePersistence />
      <Routes>
        <Route element={<MainLayout />} path="*" />
      </Routes>
    </MemoryRouter>
  );
};

function MainLayout() {
  const location = useLocation();
  const pathname = location.pathname;
  const route = pathname as keyof typeof ROUTES;
  useSettings();

  return (
    <FitContainer className="relative flex h-full flex-col overflow-hidden bg-neutral-4 font-sans">
      <ScreenSize>
        {/* Header */}
        <Header route={route} />
        {/* State Screens */}
        <LoadingScreen route={route} />
        <ErrorScreen route={route} />
        <DuplicatedScreen route={route} />
        {/* Content Screens */}
        <SetupScreen route={route} />
        <SessionScreen route={route} />
        <AboutScreen route={route} />
        <MiniScreen route={route} />
        {/* Footer */}
        <Footer route={route} />
      </ScreenSize>
    </FitContainer>
  );
}
