import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import TeamPage from "./pages/TeamPage";
import ImplementationPage from "./pages/ImplementationPage";
import UploadPage from "./pages/UploadPage";
import PredictionPage from "./pages/PredictionPage";
import NotFound from "./pages/NotFound";

import "./styles/global.css";
import { useState } from "react";

// ► updated to your live Render backend:
const API_BASE_URL = "https://knee-oa-backend.onrender.com";

const queryClient = new QueryClient();

const App = () => {
  const [prediction, setPrediction] = useState<{
    file: File | null;
    label?: string;
    confidence?: number;
  }>({
    file: null,
  });

  return (
    <QueryClientProvider client={queryClient}>
      {/* add basename so client-side routes work under /koa-detection/ */}
      <BrowserRouter basename="/koa-detection">
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/implementation" element={<ImplementationPage />} />
              <Route
                path="/upload"
                element={
                  <UploadPage
                    apiUrl={API_BASE_URL}
                    setPrediction={setPrediction}
                  />
                }
              />
              <Route
                path="/prediction"
                element={<PredictionPage prediction={prediction} />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
