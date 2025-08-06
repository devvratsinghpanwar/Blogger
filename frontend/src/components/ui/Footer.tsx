"use client";

import { useNavigate } from "react-router-dom";
import { Button } from "./button";
import InfiniteScroll from "./Infinite-scroll";

const items = [
  { content: "Text Item 1" },
  { content: <p>Paragraph Item 2</p> },
  { content: "Text Item 3" },
  { content: <p>Paragraph Item 4</p> },
  { content: "Text Item 5" },
  { content: <p>Paragraph Item 6</p> },
  { content: "Text Item 7" },
  { content: <p>Paragraph Item 8</p> },
  { content: "Text Item 9" },
  { content: <p>Paragraph Item 10</p> },
  { content: "Text Item 11" },
  { content: <p>Paragraph Item 12</p> },
  { content: "Text Item 13" },
  { content: <p>Paragraph Item 14</p> },
];

export default function Footer() {
  const navigate = useNavigate();
  function handleGetStarted() {
    navigate("/signup");
  }
  return (
    <footer className="w-full bg-black relative z-10">
      {/* Constrain height to look like a footer */}
      <div className="relative h-[400px] w-full max-w-5xl mx-auto px-4">
        {/* Infinite Scroll - behind the card */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <InfiniteScroll
            items={items}
            width="100%"
            maxHeight="100%"
            isTilted={true}
            tiltDirection="left"
            autoplay
            autoplaySpeed={0.3}
            autoplayDirection="down"
            pauseOnHover
          />
        </div>

        {/* Glass card - centered */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="relative">
            {/* Glowing border */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 blur-md opacity-70 animate-pulse"></div>

            {/* Card content */}
            <div className="relative backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-12 shadow-xl max-w-2xl w-full">
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white text-center md:text-left">
                  Get Started
                </h1>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-500 hover:to-purple-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
                  onClick={handleGetStarted}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
