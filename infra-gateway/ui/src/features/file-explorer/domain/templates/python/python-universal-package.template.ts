import { createSubPackageTree } from "../builder/sub-package-tree.builder";

export const PYTHON_UNIVERSAL_PACKAGE_TEMPLATE = createSubPackageTree({
  id: "python-universal-package-architecture",
  name: "Python Universal Package (package-structure.md)",
  description: "Comprehensive 100% complete Python sub-package: FastAPI, Alembic, contracts, src (api, features, infra, shared), database, tests, scripts, deploy, build",
  language: "python",
  rootFolderName: "analytics-service",
  contracts: {
    openapi: `openapi: 3.0.0\ninfo:\n  title: Analytics Service API\n  version: 1.0.0`,
    graphql: `type Metric {\n  id: ID!\n  value: Float!\n}`,
    proto: `syntax = "proto3";\npackage analytics.v1;\nmessage MetricEvent { string name = 1; double value = 2; }`,
    asyncapi: `asyncapi: 2.6.0\ninfo:\n  title: Analytics Events\n  version: 1.0.0`,
  },
  mainApiFile: {
    name: "main.py",
    content: `from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get("/health")\ndef health_check():\n    return {"status": "ok"}`,
  },
  featureName: "metrics",
  featureFiles: [
    {
      name: "__init__.py",
      content: `from .service import calculate_percentile\n__all__ = ["calculate_percentile"]`,
    },
    {
      name: "service.py",
      content: `def calculate_percentile(values: list[float], percentile: float) -> float:\n    if not values:\n        return 0.0\n    values.sort()\n    idx = int(len(values) * percentile)\n    return values[min(idx, len(values) - 1)]`,
    },
  ],
  migrationFiles: [
    {
      name: "0001_create_metrics_table.py",
      content: `from alembic import op\nimport sqlalchemy as sa\n\ndef upgrade():\n    op.create_table(\n        'metrics',\n        sa.Column('id', sa.String(), primary_key=True),\n        sa.Column('value', sa.Float(), nullable=False)\n    )\n\ndef downgrade():\n    op.drop_table('metrics')`,
    },
  ],
  dockerfileContent: `FROM python:3.11-slim\nWORKDIR /app\nCOPY pyproject.toml .\nRUN pip install .\nCOPY src ./src\nCMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]`,
  dockerfileDevContent: `FROM python:3.11-slim\nWORKDIR /app\nCMD ["uvicorn", "src.api.main:app", "--reload"]`,
  dockerComposeContent: `version: '3.8'\nservices:\n  analytics-service:\n    build:\n      context: ../..\n      dockerfile: build/Dockerfile\n    ports:\n      - "8000:8000"`,
  packageMetaContent: `name: analytics-service\nversion: 0.1.0\nlanguage: python\nstage: 2`,
  portRegistryContent: `HTTP_PORT=8000\nGRPC_PORT=50051`,
  unitTestContent: `from src.features.metrics.service import calculate_percentile\ndef test_percentile():\n    assert calculate_percentile([10, 20, 30], 0.5) == 20`,
  scriptRunContent: `#!/usr/bin/env bash\nexec uvicorn src.api.main:app --reload`,
});
