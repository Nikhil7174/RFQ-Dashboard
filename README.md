# Pactle - Quotation Management System

A professional enterprise B2B quotation management dashboard built with React, TypeScript, Redux Toolkit, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- **Authentication System**: Mock email/password authentication with role-based access
- **Role-Based Permissions**: Three roles (Manager, Sales Rep, Viewer) with distinct capabilities
- **Quotations List**: Search, filter by status, pagination with optimistic updates
- **Quotation Detail View**: Complete quotation information with inline editing
- **Line Items Display**: Detailed breakdown with SKU, quantity, unit, rate, and amount for each item
- **Status History Timeline**: Visual timeline showing all status changes with user info and timestamps
- **Comments & Replies**: Threaded comments with role-based visibility (up to 2 levels)
- **Optimistic Updates**: Instant UI updates with automatic rollback on errors
- **Rejection Workflow**: Optional reason collection when rejecting quotations
- **Unsaved Changes Protection**: Warns users before navigating away from unsaved edits

### Product Sense Extras ✨
1. **URL-Driven State**: All filters are persisted in URL query params for resilient page reloads
2. **Keyboard Shortcuts**: Press `/` to quickly focus the search input
3. **First-Run Empty States**: Helpful guidance when no data is available
4. **Inline Status History Timeline**: Complete timeline showing who changed status, when, and why
5. **Debounced Search**: 300ms debounce for optimal performance
6. **Unsaved Changes Guard**: Prevents accidental navigation away from unsaved edits with confirmation dialog
7. **Line Items Breakdown**: Detailed SKU-level breakdown with subtotal, GST, and freight
8. **Rejection Reason Dialog**: Managers can provide optional context when rejecting quotations

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript
- **State Management**: Redux Toolkit with normalized state
- **Routing**: React Router v6+
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form
- **Notifications**: Sonner (toast notifications)

### Folder Structure
```
src/
├── app/                    # Application setup
├── components/             # Reusable UI components
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components (TopBar, DashboardLayout)
│   ├── StatusPill.tsx     # Status badge component
│   ├── EmptyState.tsx     # Empty state component
│   └── LoadingSpinner.tsx # Loading indicator
├── features/               # Feature-based modules
│   ├── auth/              # Authentication
│   │   ├── AuthGuard.tsx
│   │   └── authService.ts
│   └── quotations/        # Quotations feature
│       ├── hooks/         # Custom hooks
│       └── components/    # Feature-specific components
├── lib/                    # Utilities
│   ├── types.ts           # TypeScript definitions
│   ├── permissions.ts     # Permission helpers
│   ├── storage.ts         # localStorage utilities
│   ├── mockApi.ts         # Mock API service
│   └── utils.ts           # General utilities
├── pages/                  # Page components
│   ├── SignIn.tsx
│   ├── SignUp.tsx
│   ├── ForgotPassword.tsx
│   ├── QuotationsList.tsx
│   └── QuotationDetail.tsx
├── store/                  # Redux store
│   ├── index.ts           # Store configuration
│   ├── hooks.ts           # Typed hooks
│   └── slices/            # Redux slices
│       ├── authSlice.ts
│       └── quotationsSlice.ts
└── index.css              # Global styles & design system
```

## 🎨 Design System

The application uses a comprehensive design system defined in `src/index.css`:

- **Color Palette**: Professional blues with semantic status colors
- **Status Pills**: Distinct visual indicators for Pending/Approved/Rejected
- **Typography**: Clear hierarchy with system fonts
- **Spacing**: Consistent spacing scale
- **Animations**: Smooth transitions for state changes

All colors use HSL format for better theme management and are exposed as CSS custom properties.

## 🔐 Permission Model

### Roles & Capabilities

| Role | Approve/Reject | Edit Details | Add Comment | Add Reply | View |
|------|----------------|--------------|-------------|-----------|------|
| Manager | ✅ | ✅ | ✅ | ✅ | ✅ |
| Sales Rep | ❌ | ❌ | ✅ | ❌ | ✅ |
| Viewer | ❌ | ❌ | ❌ | ❌ | ✅ |

### UI Gating
- Actions are conditionally rendered based on user role
- Permission checks happen at multiple levels:
  1. Component level (using `getAvailableActions` utility)
  2. Button visibility
  3. Form field editability

### Reply Visibility
- Comments are visible to all users
- Replies are only visible to users with the same role as the replier
- Managers can see all replies

## ⚡ Optimistic Update Strategy

The application implements optimistic updates for better UX:

1. **Immediate UI Update**: State is updated optimistically before API call
2. **API Call**: Async action is dispatched with 1s simulated delay
3. **Success**: UI already shows correct state
4. **Error**: State is rolled back to previous value with error toast

### Implementation
```typescript
// Optimistic update
dispatch(optimisticStatusUpdate({ id, status: newStatus }));

try {
  await dispatch(updateQuotationStatus({ id, status: newStatus })).unwrap();
  toast.success('Updated successfully');
} catch (error) {
  // Rollback on error
  dispatch(rollbackStatusUpdate({ id, previousStatus }));
  toast.error('Failed to update');
}
```

## 🧪 Mock API Layer

Located in `src/lib/mockApi.ts`, the mock API:
- Simulates 1 second network delay
- Provides realistic error scenarios (10% failure rate)
- Persists data in memory during session
- Includes 5 sample quotations with varied states

### Available Endpoints
- `GET /quotations` - List with search/filter
- `GET /quotations/:id` - Single quotation
- `PATCH /quotations/:id` - Update quotation
- `POST /quotations/:id/comments` - Add comment
- `POST /comments/:id/replies` - Add reply

## 🚦 Setup & Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Trade-offs & Future Work

### Current Trade-offs
1. **Local Storage Auth**: Real JWT validation would use httpOnly cookies
2. **Pagination Implemented**: Currently using page-based pagination; could add infinite scroll as alternative
3. **Basic Form Validation**: More robust validation with Zod schemas could be added
4. **No Real-Time Updates**: WebSocket integration for collaborative features
5. **Limited Testing**: Unit tests for critical paths (permissions, reducers) recommended

### Future Enhancements
- **Phase 2 Features** (planned):
  - Additional keyboard shortcuts (a to approve, r to reject, e to edit, Escape to cancel)
  - Draft persistence for comments (auto-save and restore)
  - Better inline validation with helpful error messages
- **Phase 3 Features** (planned):
  - Printable/PDF-friendly view
  - Scroll position preservation when navigating
  - Demo video/GIFs
- **Long-term**:
  - Advanced filtering (date range, amount range)
  - Bulk actions (approve/reject multiple)
  - Email notifications
  - Dark mode toggle
  - Conflict resolution for concurrent edits
  - Offline-first with service worker

## 🎯 Performance Optimizations

1. **Memoization**: All callbacks use `useCallback` to prevent unnecessary re-renders
2. **Debounced Search**: 300ms delay reduces API calls
3. **Normalized State**: Redux state is normalized for efficient updates
4. **Lazy Loading**: Comments/replies are loaded on demand
5. **Code Splitting**: Route-based code splitting with React.lazy (potential)

## 📊 State Management

### Redux Store Structure
```typescript
{
  auth: {
    user: User | null,
    token: string | null,
    isAuthenticated: boolean
  },
  quotations: {
    quotations: Quotation[],
    currentQuotation: Quotation | null,
    loading: boolean,
    error: string | null,
    filters: {
      search: string,
      status: string
    }
  }
}
```

## 🔑 Key Best Practices

1. **Single Source of Truth**: Redux store is the single source for all application state
2. **Immutable Updates**: All state updates use Redux Toolkit's Immer
3. **Type Safety**: Full TypeScript coverage with strict mode
4. **Custom Hooks**: Feature-specific hooks encapsulate complex logic
5. **Error Boundaries**: Graceful error handling with fallback UI
6. **Accessibility**: ARIA labels, focus management, keyboard navigation

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- Touch-friendly targets (min 44x44px)
- Optimized layouts for all screen sizes

## 🔍 Testing Approach

While this demo doesn't include tests, the architecture supports:

1. **Unit Tests**: Permission helpers, utilities
2. **Integration Tests**: Redux slices, custom hooks
3. **E2E Tests**: Critical user flows (auth, approve/reject)

## 📖 Getting Started Guide

1. **Sign Up**: Create an account with any role
2. **Browse Quotations**: View the list, try searching and filtering
3. **Switch Roles**: Use the profile dropdown to test different permission levels
4. **Approve/Reject**: (Manager only) Try optimistic updates
5. **Add Comments**: (Sales Rep/Manager) Post comments on quotations
6. **Reply to Comments**: (Manager only) Add threaded replies
7. **Edit Details**: (Manager only) Edit client name and amount

## 🌟 Product Sense Highlights

This application demonstrates product thinking through:
- **Helpful Empty States**: Clear guidance when no data exists
- **Smart Defaults**: Sensible default values and states
- **Progressive Disclosure**: Lazy-loaded replies reduce initial complexity
- **Feedback at Every Step**: Loading states, success/error toasts
- **Keyboard Shortcuts**: Power user features
- **URL State**: Shareable links with preserved filters

---

Built with ❤️ using modern React best practices and production-grade patterns.
