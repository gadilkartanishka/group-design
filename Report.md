# Group Design – Bridge Module Development Report

## Overview
This report documents the architectural setup and development methodology for the Osdag Screening Task's "Group Design" module. The web application effectively captures and validates user choices to determine geometry inputs, structural bridge material configurations, and localized environmental loads based on Indian reference datasets.

## Methodology

### 1. **Frontend Architecture**
- **Framework**: Developed using **React** (bootstrapped with Vite) for a component-driven, purely functional UI.
- **State Management**: Heavily leverages `useState` and `useEffect` hooks across modular elements (e.g., `Sidebar.jsx`, `ProjectLocationPanel.jsx`) to handle dependent reactive updates (like toggling available panels when "Other Structure" is checked) strictly avoiding legacy class components.
- **Styling**: Standard **Vanilla CSS** provides structured layout with exact control over custom modal layouts, standardizing dropdown appearances, highlighting values in designated colors effectively (such as the `#6fb246` green requirement for result blocks), without relying on heavy framework dependencies like Tailwind.

### 2. **Backend Architecture**
- **Framework**: Built with **Django** utilizing **Django REST Framework (DRF)**.
- **API Endpoints**: 
  - Standard REST APIs handle core operations such as querying options: `/api/basic-inputs/options/`
  - Specialized endpoints evaluate constrained geometry iteratively mapping inputs to dependent values: `/api/geometry/additional/`.
- **Validation**: Backend aggressively enforces software limits (e.g., limits `Span` between 20-45m) returning structured JSON errors rendered individually under frontend inputs.

### 3. **Database Integration (Option A Completed)**
- A robust Python aggregation script (`build_processed_location_data.py`) was constructed to merge unorganized regional datasets (temperature, seismic, wind) into a singular relational structure stored cleanly in `location_database.json`.
- The frontend exposes dynamic hierarchical dropdown menus mapping these relationships (`State` -> `District`), immediately fetching local parameters via an optimized backend query API without caching bottlenecks. Any undefined data point correctly returns `N/A`.

## Challenges Faced

1. **Geometry Constraints Calculus**: 
   - Resolving the cyclic interdependency of the pop-up menu parameters `Girder Spacing`, `No. of Girders`, and `Deck Overhang Width` to satisfy *(Overall Width – Overhang) / Spacing = No. of Girders* required careful identification of the "driving" inputs vs. dynamically calculated targets, enforcing consistent payload management through HTTP requests to avoid calculation loops.
2. **State Management Synchronization**: 
   - Managing and syncing local input states (Span, Skew Angle) within Modals before passing them seamlessly back up to the unifying API required clear separation of logic in the parent Component context hierarchy.

## References
1. Osdag GitHub Source Examples & Reference Manuals
2. Django REST Framework API Design Documentations (https://www.django-rest-framework.org) 
3. Code layout conventions strictly aligned to the Osdag screening instructions provided payload (Bridge Configuration PDF logic).
