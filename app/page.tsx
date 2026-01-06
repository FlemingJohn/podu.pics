'use client';

import Dither from "@/components/Dither";
import { ArrowUpIcon, Image, Star } from "@phosphor-icons/react/dist/ssr";
import { useState, useEffect } from "react";

export default function Home() {
  const [dragActive, setDragActive] = useState(false);
  const [starCount, setStarCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('https://api.github.com/repos/JustinBenito/podu.pics')
      .then(res => res.json())
      .then(data => setStarCount(data.stargazers_count))
      .catch(err => console.error('Failed to fetch star count:', err));
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    // Handle file upload here
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle the file
      console.log(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      // Handle the file
      console.log(e.target.files[0]);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black">
      <Dither
        waveColor={[0.59, 0.83, 0.37]}
        disableAnimation={false}
        enableMouseInteraction
        mouseRadius={0.8}
        colorNum={4}
        pixelSize={2}
        waveAmplitude={0.3}
        waveFrequency={3}
        waveSpeed={0.05}
      />

      {/* Contribute Button */}
      <a
        href="https://github.com/JustinBenito/podu.pics"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-6 right-6 z-10 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border-[1px] border-white/30 rounded-full text-white font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2"
      >
        <Star size={20} weight="fill" />
        Contribute
        {starCount !== null && (
          <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-sm">
            {starCount}
          </span>
        )}
      </a>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-8 pointer-events-none">
        <h1 className="font-[family-name:var(--font-instrument-serif)] text-8xl md:text-[256px] text-white">
          Podu.pics
        </h1>

        <div className="w-[90%] max-w-2xl bg-white/10 backdrop-blur-xl rounded-[32px] shadow-2xl p-8 md:p-4 border border-white/20 pointer-events-auto">

          <form
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className="relative"
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleChange}
              accept="image/*"
            />

            <label
              htmlFor="file-upload"
              className={`
                flex flex-col items-center justify-center
                min-h-[200px] md:min-h-[300px] p-8 md:p-12
                border-4 border-dashed rounded-2xl
                cursor-pointer transition-all duration-200
                ${dragActive
                  ? 'border-green-400 bg-green-500/10'
                  : 'border-white/30 hover:border-white/50 hover:bg-white/5'
                }
              `}
            >
              <div className="flex flex-col items-center gap-4">
                <Image
                  size={48}
                  weight="light"
                  className={dragActive ? 'text-green-400' : 'text-white/60'}
                />
                <div className="text-center">
                  <p className="text-xl font-medium text-white mb-2">
                    {dragActive ? 'Drop your image here' : 'turn your imgs into links'}
                  </p>
                  <p className="text-sm text-white/70">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </label>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-white/60 font-bold text-md">
          Developed with love by Justin and Hari
        </p>
      </footer>
    </div>
  );
}
