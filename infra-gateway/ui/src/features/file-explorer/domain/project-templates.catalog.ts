import type { ProjectTemplate } from "./entities/file-node.entity";
import { NEXTJS_EXTREME_SCALE_TEMPLATE } from "./templates/nextjs/nextjs-extreme-scale.template";
import { NODE_UNIVERSAL_PACKAGE_TEMPLATE } from "./templates/node/node-universal-package.template";
import { PYTHON_UNIVERSAL_PACKAGE_TEMPLATE } from "./templates/python/python-universal-package.template";
import { INFRA_GATEWAY_TEMPLATE } from "./templates/gateway/infra-gateway.template";
import { FEATURE_ANATOMY_TEMPLATE } from "./templates/feature-slice/feature-anatomy.template";
import { API_FIRST_TEMPLATE } from "./templates/api-first/api-first.template";
import { OPENVSCODE_PIPELINE_TEMPLATE } from "./templates/openvscode/openvscode-pipeline.template";
import { BLANK_WORKSPACE_TEMPLATE } from "./templates/blank/blank-workspace.template";

export {
  NEXTJS_EXTREME_SCALE_TEMPLATE,
  NODE_UNIVERSAL_PACKAGE_TEMPLATE,
  PYTHON_UNIVERSAL_PACKAGE_TEMPLATE,
  INFRA_GATEWAY_TEMPLATE,
  FEATURE_ANATOMY_TEMPLATE,
  API_FIRST_TEMPLATE,
  OPENVSCODE_PIPELINE_TEMPLATE,
  BLANK_WORKSPACE_TEMPLATE,
};

export const PROJECT_TEMPLATES_CATALOG: ProjectTemplate[] = [
  NEXTJS_EXTREME_SCALE_TEMPLATE,
  NODE_UNIVERSAL_PACKAGE_TEMPLATE,
  PYTHON_UNIVERSAL_PACKAGE_TEMPLATE,
  INFRA_GATEWAY_TEMPLATE,
  FEATURE_ANATOMY_TEMPLATE,
  API_FIRST_TEMPLATE,
  OPENVSCODE_PIPELINE_TEMPLATE,
  BLANK_WORKSPACE_TEMPLATE,
];
