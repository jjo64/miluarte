import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Center,
  useGLTF,
  useAnimations,
  useProgress,
  Html,
  ContactShadows,
  Bounds,
} from "@react-three/drei";
import { RotateCw, Maximize2, Minimize2, ZoomIn, Loader2, Sparkles } from "lucide-react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

interface ModelProps {
  url: string;
}

function Model({ url }: ModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(
    url,
    "https://www.gstatic.com/draco/versioned/decoders/1.5.5/"
  );
  const { actions } = useAnimations(animations, groupRef);

  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      Object.values(actions).forEach((action) => {
        action?.reset().fadeIn(0.3).play();
      });
    }
  }, [actions]);

  useEffect(() => {
    // Configurar materiales ligeros para 60 FPS fluidos
    scene.traverse((child: any) => {
      if (child.isMesh) {
        if (child.material) {
          child.material.side = THREE.FrontSide;
        }
      }
    });
  }, [scene]);

  return (
    <group ref={groupRef}>
      <Center top>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

function Loader() {
  const { progress, active } = useProgress();
  if (!active) return null;

  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-black/85 backdrop-blur-md border border-white/10 text-white min-w-[190px] shadow-2xl">
        <Loader2 className="w-6 h-6 text-[#E55427] animate-spin mb-2" />
        <p className="text-[11px] font-medium tracking-wider uppercase text-neutral-300 mb-2">
          Cargando 3D
        </p>
        <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#E55427] to-[#EAA898] h-full transition-all duration-200"
            style={{ width: `${Math.round(progress)}%` }}
          />
        </div>
        <span className="text-[10px] text-neutral-400 mt-1.5 font-mono">
          {Math.round(progress)}%
        </span>
      </div>
    </Html>
  );
}

interface ModelViewer3DProps {
  modelUrl: string;
  className?: string;
  autoRotateDefault?: boolean;
  isHero?: boolean;
}

export function ModelViewer3D({
  modelUrl,
  className = "w-full h-[500px]",
  autoRotateDefault = true,
  isHero = false,
}: ModelViewer3DProps) {
  const [autoRotate, setAutoRotate] = useState(autoRotateDefault);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-gradient-to-b from-[#181210] to-[#0A0706] rounded-2xl select-none border border-brand-cream/10 shadow-2xl ${
        isFullscreen ? "fixed inset-0 z-[9999] h-screen rounded-none" : className
      }`}
    >
      {/* Badge Hero */}
      {isHero && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-brand-orange/40 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#E55427] animate-ping" />
          <span>3D Interactivo en Vivo</span>
        </div>
      )}

      {/* Controles flotantes */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2 rounded-xl border backdrop-blur-md transition-all duration-200 cursor-pointer ${
            autoRotate
              ? "bg-[#E55427] text-white border-[#E55427]"
              : "bg-black/60 text-neutral-300 border-white/10 hover:bg-black/80 hover:text-white"
          }`}
          title={autoRotate ? "Pausar giro automático" : "Giro automático"}
        >
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? "animate-spin" : ""}`} style={{ animationDuration: "8s" }} />
        </button>

        <button
          type="button"
          onClick={resetCamera}
          className="p-2 rounded-xl bg-black/60 border border-white/10 text-neutral-300 hover:bg-black/80 hover:text-white backdrop-blur-md transition-all duration-200 cursor-pointer"
          title="Centrar y alejar vista"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-black/60 border border-white/10 text-neutral-300 hover:bg-black/80 hover:text-white backdrop-blur-md transition-all duration-200 cursor-pointer"
          title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Indicador interactivo */}
      <div className="absolute bottom-3 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 border border-white/10 backdrop-blur-md text-[10px] text-neutral-300">
        <Sparkles className="w-3 h-3 text-[#E55427]" />
        <span>Arrastra para rotar • Rueda para zoom</span>
      </div>

      {/* Canvas 3D Ultra Optimizado para 60 FPS en pantalla completa y ventana */}
      <Canvas
        camera={{ position: [11, 7, 13], fov: 38 }}
        dpr={1} // Forzar 1:1 en pantalla completa para máximo rendimiento de GPU
        gl={{
          powerPreference: "high-performance",
          antialias: false, // Desactivar antialias pesado para fluidez instantánea
          alpha: true,
          stencil: false,
          depth: true,
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        {/* Iluminación nativa de estudio ultra rápida (Sin HDR pesado) */}
        <ambientLight intensity={1.3} />
        <hemisphereLight args={["#FFF8F0", "#2A1E18", 0.9]} />
        <directionalLight position={[12, 16, 10]} intensity={1.5} />
        <directionalLight position={[-12, 10, -10]} intensity={0.7} />

        <Suspense fallback={<Loader />}>
          <Bounds fit clip observe margin={1.4}>
            <Model url={modelUrl} />
          </Bounds>

          <ContactShadows
            position={[0, -0.02, 0]}
            opacity={0.4}
            scale={30}
            blur={2}
            far={6}
            resolution={256}
            frames={1}
          />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          autoRotate={autoRotate}
          autoRotateSpeed={1.2}
          maxPolarAngle={Math.PI / 2 + 0.04}
          minDistance={1.5}
          maxDistance={45}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/Matelec-optimized.glb", "https://www.gstatic.com/draco/versioned/decoders/1.5.5/");
