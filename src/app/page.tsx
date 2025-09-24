"use client";
import Navbar from "./components/Navbar/AppNavbar";
import Hero from "./components/pages/Home/Home-Hero";
import dynamic from "next/dynamic";
import FloatingChatButton from "./components/ui/FloatingChatButton";
const LandingPage = dynamic(
  () =>
    import("./components/pages/Home/Home-Landing").then((mod) => mod.default),
  { ssr: false },
);
const LightRays = dynamic(
  () =>
    import("./components/ui/LightRays").then((mod) => mod.default),
  { ssr: false },
);
const HomeAIOpticalCharacterRecognition = dynamic(
  () =>
    import("./components/pages/Home/Home-AIOpticalCharacterRecognition").then((mod) => mod.default),
  { ssr: false },
);
const HomeUnlockAIPowerforYourBusiness = dynamic(
  () =>
    import("./components/pages/Home/Home-UnlockAIPowerforYourBusiness").then((mod) => mod.default),
  { ssr: false },
);
const HomeAIFaceRecognition = dynamic(
  () =>
    import("./components/pages/Home/Home-AIFaceRecognition").then((mod) => mod.default),
  { ssr: false },
);

const PoweringSearchengineSection = dynamic(
  () =>
    import("./components/pages/Home/Home-PoweringSearchengine").then(
      (mod) => mod.default,
    ),
  { ssr: false },
);

const ChatSaleByAISection = dynamic(
  () =>
    import("./components/pages/Home/Home-ChatSaleByAISection").then(
      (mod) => mod.default,
    ),
  { ssr: false },
);

const ChatsalebyAI = dynamic(
  () =>
    import("./components/pages/Home/Home-CaseStudies&Resources").then(
      (mod) => mod.default,
    ),
  { ssr: false },
);
export default function Home() {
  return (
    <>
      <div className="overflow-hidden">
        <div style={{ width: "100%", height: "800px", position: "absolute" }}>
          <LightRays
            raysOrigin="top-center"
            raysColor="#ffffff"
            raysSpeed={1.5}
            lightSpread={0.7}     
            rayLength={0.55}
            followMouse={true}
            mouseInfluence={0}
            noiseAmount={0.1}
            distortion={0.05}
            className="custom-rays z-[-1]"
          />
        </div>
        <Navbar />
        <Hero />
        <LandingPage />
        <PoweringSearchengineSection />
        <ChatSaleByAISection />
        <HomeAIFaceRecognition />
        <HomeAIOpticalCharacterRecognition />
        <ChatsalebyAI />
        <HomeUnlockAIPowerforYourBusiness />
        <FloatingChatButton />
      </div>
    </>
  );
}
