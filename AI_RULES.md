# AI Rules for VintedPro App Development

This document outlines the core technologies and specific library usage guidelines for developing the VintedPro application. Adhering to these rules ensures consistency, maintainability, and leverages the strengths of our chosen tech stack.

## Tech Stack Overview

1.  **Frontend Framework**: React.js for building interactive user interfaces.
2.  **Language**: TypeScript for new components and logic, ensuring type safety and better code quality. Existing JavaScript files will remain as is.
3.  **Styling**: Tailwind CSS for all utility-first styling, enabling rapid and consistent UI development.
4.  **UI Components**: shadcn/ui for a collection of accessible and customizable UI components.
5.  **Routing**: React Router for declarative client-side navigation.
6.  **State Management/Data Fetching**: TanStack Query (React Query) for efficient server state management, caching, and synchronization.
7.  **Animations**: Framer Motion for fluid and declarative UI animations.
8.  **Icons**: Lucide React for a comprehensive set of customizable vector icons.
9.  **Notifications**: Sonner for elegant and accessible toast notifications.
10. **Charting**: Recharts for responsive and customizable data visualization.
11. **Backend Interaction**: Base44 SDK for seamless integration with the Base44 backend services (entities, functions, authentication).
12. **Backend Functions**: Deno for serverless functions, utilizing `npm:` specifiers for Node.js module compatibility.
13. **Build Tool**: Vite for a fast and optimized development experience.

## Library Usage Rules

To maintain a consistent and efficient codebase, please follow these guidelines for library usage:

*   **UI Components**:
    *   **Always** prioritize using components from `shadcn/ui` (imported from `@/components/ui/`) when a suitable component exists for your needs.
    *   **Do NOT** modify `shadcn/ui` component files directly. If a component requires significant customization or a new component is needed, create it in `src/components/` and style it with Tailwind CSS.
*   **Styling**:
    *   **Exclusively** use Tailwind CSS classes for all component styling. Avoid inline styles or custom CSS files, except for global styles defined in `src/index.css`.
*   **Icons**:
    *   **Always** use icons from the `lucide-react` library.
*   **Data Fetching & Backend Interaction**:
    *   Use the `base44` client (from `src/api/base44Client.js`) for all interactions with Base44 entities, functions, and authentication.
    *   For managing server state, caching, and asynchronous data operations on the client-side, **always** use TanStack Query (`useQuery`, `useMutation`).
*   **Routing**:
    *   **All** client-side navigation must be handled using `react-router-dom`. Route definitions should remain centralized in `src/App.jsx`, and `createPageUrl` (from `src/utils/index.ts`) should be used for generating internal links.
*   **Animations**:
    *   For any UI animations, **prefer** using `framer-motion` for its declarative and performant approach.
*   **Notifications**:
    *   Use `sonner` for displaying all user-facing toast notifications.
*   **Charting**:
    *   **All** data visualization and charting should be implemented using `recharts`.
*   **New Files**:
    *   New React components should be placed in `src/components/`.
    *   New pages should be placed in `src/pages/`.
    *   New utility functions or hooks should be placed in `src/utils/` or `src/hooks/` respectively.
    *   **All new files** (components, pages, hooks, utilities) should be written in **TypeScript** (`.tsx` or `.ts`).
*   **Deno Functions**:
    *   Backend logic that requires server-side execution should be implemented as Deno functions within the `functions/` directory. Use `npm:` specifiers for importing Node.js packages.