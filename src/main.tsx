import { createRoot } from "react-dom/client";
import "./style.css";
import "./entrance/entrance.css";
import "./heroine/heroine.css";
const root = createRoot(document.getElementById("root")!);
if (
  import.meta.env.DEV &&
  new URLSearchParams(window.location.search).get("preview") === "heroine"
) {
  void import("./dev/HeroinePreview").then(({ default: Preview }) =>
    root.render(<Preview />),
  );
} else {
  void import("./App").then(({ default: App }) => root.render(<App />));
}
