"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ContainerWorkspace } from "@/features/docker-lab/ui/components/ContainerWorkspace";

export default function ContainerWorkspacePage({ params }: { params: Promise<{ containerId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [containerInfo, setContainerInfo] = useState<{ containerName: string; imageId: string }>({
    containerName: resolvedParams.containerId,
    imageId: "default",
  });

  useEffect(() => {
    fetch(`/api/docker-lab/containers`)
      .then((res) => res.json())
      .then((data) => {
        const found = (data.containers || []).find((c: any) => c.containerId === resolvedParams.containerId);
        if (found) {
          setContainerInfo({
            containerName: found.containerName || resolvedParams.containerId,
            imageId: found.imageId || "default",
          });
        }
      })
      .catch(() => {});
  }, [resolvedParams.containerId]);

  return (
    <ContainerWorkspace
      containerId={resolvedParams.containerId}
      containerName={containerInfo.containerName}
      imageId={containerInfo.imageId}
      onBackToLab={() => router.push("/docker-lab")}
    />
  );
}
