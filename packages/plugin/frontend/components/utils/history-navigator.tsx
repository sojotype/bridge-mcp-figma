import { useEffect } from "react";
import { useNavigate } from "react-router";

export function HistoryNavigator() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 3) {
        navigate(-1);
      } else if (event.button === 4) {
        navigate(1);
      }
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [navigate]);

  return null;
}
