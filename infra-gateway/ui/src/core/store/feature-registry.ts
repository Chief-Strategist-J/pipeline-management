import type { Reducer } from "@reduxjs/toolkit";
import { ocspFeatureConfig } from "@/features/ocsp-stapling";
import { compilerFeatureConfig } from "@/features/proxy-compiler";
import { sandboxFeatureConfig } from "@/features/sandbox-generator";
import { roadmapFeatureConfig } from "@/features/roadmap-matrix";

export interface FeatureModule {
  key: string;
  reducer: Reducer;
  saga: () => Generator;
}

export const featureRegistry: FeatureModule[] = [
  ocspFeatureConfig,
  compilerFeatureConfig,
  sandboxFeatureConfig,
  roadmapFeatureConfig,
];
