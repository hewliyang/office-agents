import { mount } from "svelte";
import App from "./components/app.svelte";
import "@office-agents/core/index.css";
import "./index.css";

Office.onReady(() => {
  const target = document.getElementById("container");
  if (!target) return;

  mount(App, { target });
});
