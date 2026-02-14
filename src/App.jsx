import { useState } from "react";
import Home from "./pages/Home";

function App() {
  const [start, setStart] = useState(false);

  return (
    <div className="w-screen h-screen bg-black overflow-hidden">
      <Home start={start} setStart={setStart} />
    </div>
  );
}

export default App;
