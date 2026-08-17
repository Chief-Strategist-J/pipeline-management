# Architecture Documentation

Welcome to the **Pipeline Management Architecture** repository index.

## System Architecture Documents

1. [**Docker Lab Extreme-Scale Architecture & Multi-Phase Rules Engine**](./DOCKER_LAB_ARCHITECTURE.md)
   - **High-Level Design (HLD)**: System Context, Component Diagram, Hexagonal Port & Adapter Boundaries, Sequence Diagrams.
   - **Low-Level Design (LLD)**: Two-Phase Rules Engine (`dockerExecRules` & `dockerExecStrategyRules`), Constants Architecture, Dynamic Container Inspector (`inspectContainer`).
   - **Detailed Rule Specification Matrix**: Complete breakdown of native CLI paths, transformation rules, and health probes across all 47+ infrastructure Docker images.
   - **Core Algorithms & Pseudocodes**: Formal pseudocodes for rule evaluation, execution strategies, and API route controllers.
