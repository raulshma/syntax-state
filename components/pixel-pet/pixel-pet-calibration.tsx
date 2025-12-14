"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Center } from "@react-three/drei";
import { RotateCcw, Check, ChevronLeft, ChevronRight } from "lucide-react";

import { PixelPetModel } from "@/components/pixel-pet/pixel-pet-model";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PixelPetCalibrationProps {
  fileName: string;
  modelScale: number;
  hasAnimations?: boolean;
  currentOrientation: number;
  onOrientationChange: (degrees: number) => void;
  onOrientationConfirm: (degrees: number) => Promise<void>;
}

// Preset positions for quick calibration
const PRESET_POSITIONS = [
  { label: "Front", degrees: 0, icon: "↑" },
  { label: "Right", degrees: 90, icon: "→" },
  { label: "Back", degrees: 180, icon: "↓" },
  { label: "Left", degrees: 270, icon: "←" },
] as const;

// Inner component for the rotating model
function CalibrationModel({
  fileName,
  modelScale,
  hasAnimations,
  rotationY,
}: {
  fileName: string;
  modelScale: number;
  hasAnimations: boolean;
  rotationY: number;
}) {
  const groupRef = React.useRef<THREE.Group>(null);

  // Update rotation whenever rotationY changes
  React.useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = (rotationY * Math.PI) / 180;
    }
  }, [rotationY]);

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      <PixelPetModel
        fileName={fileName}
        modelScale={modelScale}
        hasAnimations={hasAnimations}
      />
    </group>
  );
}

export function PixelPetCalibration({
  fileName,
  modelScale,
  hasAnimations = false,
  currentOrientation,
  onOrientationChange,
  onOrientationConfirm,
}: PixelPetCalibrationProps) {
  const [previewRotation, setPreviewRotation] = React.useState(currentOrientation);
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Sync with external orientation changes
  React.useEffect(() => {
    setPreviewRotation(currentOrientation);
    setHasChanges(false);
  }, [currentOrientation]);

  const handleRotate = (deltaDegrees: number) => {
    const newRotation = (previewRotation + deltaDegrees + 360) % 360;
    setPreviewRotation(newRotation);
    setHasChanges(newRotation !== currentOrientation);
  };

  const handlePresetClick = (degrees: number) => {
    setPreviewRotation(degrees);
    setHasChanges(degrees !== currentOrientation);
  };

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      await onOrientationConfirm(previewRotation);
      onOrientationChange(previewRotation);
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPreviewRotation(currentOrientation);
    setHasChanges(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Model Calibration</Label>
        <span className="text-xs text-muted-foreground font-mono">
          {previewRotation}°
        </span>
      </div>

      {/* Preview Canvas */}
      <div className="relative rounded-2xl border border-white/10 bg-card/40 overflow-hidden">
        <div className="h-[200px] w-full">
          <Canvas
            dpr={[1, 1.5]}
            frameloop="always"
            gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
            orthographic
            camera={{ position: [0, 0, 10], zoom: 80 }}
          >
            <ambientLight intensity={0.9} />
            <directionalLight position={[3, 6, 5]} intensity={0.7} />
            <React.Suspense fallback={null}>
              <Center>
                <CalibrationModel
                  fileName={fileName}
                  modelScale={modelScale}
                  hasAnimations={hasAnimations}
                  rotationY={previewRotation}
                />
              </Center>
            </React.Suspense>
          </Canvas>
        </div>

        {/* Rotation indicator overlay */}
        <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
          <span className="text-xs text-white/80">Rotate to find front</span>
        </div>
      </div>

      {/* Rotation Controls */}
      <div className="space-y-3">
        {/* Quick Presets */}
        <div className="grid grid-cols-4 gap-2">
          {PRESET_POSITIONS.map((pos) => (
            <Button
              key={pos.degrees}
              variant={previewRotation === pos.degrees ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-10 flex-col gap-0.5",
                previewRotation === pos.degrees && "ring-2 ring-primary"
              )}
              onClick={() => handlePresetClick(pos.degrees)}
            >
              <span className="text-lg leading-none">{pos.icon}</span>
              <span className="text-[10px]">{pos.label}</span>
            </Button>
          ))}
        </div>

        {/* Fine-tune Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRotate(-45)}
            className="h-9 w-9 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="sr-only">Rotate left 45°</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRotate(-15)}
            className="h-9 px-2"
          >
            -15°
          </Button>
          <div className="flex-1 text-center">
            <span className="text-sm font-medium">{previewRotation}°</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRotate(15)}
            className="h-9 px-2"
          >
            +15°
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRotate(45)}
            className="h-9 w-9 p-0"
          >
            <ChevronRight className="w-4 h-4" />
            <span className="sr-only">Rotate right 45°</span>
          </Button>
        </div>

        {/* Action Buttons */}
        {hasChanges && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex-1"
              disabled={isSaving}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              className="flex-1"
              disabled={isSaving}
            >
              <Check className="w-3.5 h-3.5 mr-1.5" />
              {isSaving ? "Saving..." : "Set as Front"}
            </Button>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Rotate the model to show its front side, then click &quot;Set as Front&quot;. 
        This helps the pet face the correct direction when walking.
      </p>
    </div>
  );
}
