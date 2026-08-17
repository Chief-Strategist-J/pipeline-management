"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MultiStackDashboard } from "@/features/docker-lab/ui/components/MultiStackDashboard";

export default function MultiStackPage() {
  const router = useRouter();

  return (
    <MultiStackDashboard
      onBackToLab={() => router.push("/docker-lab")}
    />
  );
}
