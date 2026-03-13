import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, NavLink } from "react-router";
import { SplitDemo } from "./pages/SplitDemo";
import { TripleDemo } from "./pages/TripleDemo";
import { GridDemo } from "./pages/GridDemo";
import { TaskDemo } from "./pages/TaskDemo";
import { BannerDemo } from "./pages/BannerDemo";
import { ReadOnlyDemo } from "./pages/ReadOnlyDemo";
import { EmptyDemo } from "./pages/EmptyDemo";
import "./app.built.css";

const navLinks = [
  { to: "/", label: "Split" },
  { to: "/triple", label: "Triple" },
  { to: "/grid", label: "Grid" },
  { to: "/task", label: "Task" },
  { to: "/banner", label: "Banner" },
  { to: "/readonly", label: "Read-only" },
  { to: "/empty", label: "Empty" },
];

function App() {
  return (
    <BrowserRouter>
      <div className="h-full w-full flex flex-col">
        <header className="flex items-center gap-6 px-4 py-3 border-b border-border shrink-0">
          <h1 className="text-lg font-bold">Workspace</h1>
          <nav className="flex gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-1 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-foreground text-background" : "hover:bg-accent"}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </header>
        <div className="flex-1 min-h-0">
          <Routes>
            <Route index element={<SplitDemo />} />
            <Route path="triple" element={<TripleDemo />} />
            <Route path="grid" element={<GridDemo />} />
            <Route path="task" element={<TaskDemo />} />
            <Route path="banner" element={<BannerDemo />} />
            <Route path="readonly" element={<ReadOnlyDemo />} />
            <Route path="empty" element={<EmptyDemo />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
