import "./style.css";
import ReactDOM from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { StrictMode } from "react";
import Experience from "./Experience.jsx";
import {
  KeyboardControls,
  OrbitControls,
  Environment,
  Fisheye,
  Lightformer,
  Sky,
  Stars,
} from "@react-three/drei";
import DramaticCity from "./DramaticCity.jsx";

const root = ReactDOM.createRoot(document.querySelector("#root"));

root.render(
  <>
    <StrictMode>
      <DramaticCity />
    </StrictMode>
  </>
);
