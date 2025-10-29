# Pactle - Quotation Management System

A role-aware quotation management platform for manufacturers, built to handle the complete RFQ-to-Quote workflow with role-based permissions, optimistic updates, and enterprise-grade UX.

## 🎯 What is This?

**Pactle** automates the quote-to-cash cycle for manufacturers. This frontend demo showcases:
- **RFQ (Request for Quotation)**: Customer inquiries for pricing
- **Quote Management**: Structured responses with SKUs, pricing, taxes, and terms
- **Approval Workflow**: Role-based quotation approval with full audit trail

Built with **React 18**, **TypeScript**, **Redux Toolkit**, and **Tailwind CSS**.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

**Default Login Credentials:**
- **Manager**: manager@example.com / password123
- **Sales Rep**: sales@example.com / password123
- **Viewer**: viewer@example.com / password123

---

## ✨ Core Features Implemented

### 1. Authentication & Role Management
- ✅ Email/password authentication (mock, localStorage-based)
- ✅ Role switcher in topbar (Manager, Sales Rep, Viewer)
- ✅ Protected routes with automatic redirect
- ✅ Forgot password flow (mock)
- ✅ Session persistence with mock JWT

### 2. Quotations List Page
- ✅ **Search**: Debounced search (300ms) by client name or quotation ID
- ✅ **Filter**: Status-based filtering (Pending, Approved, Rejected)
- ✅ **Pagination**: Page-based navigation with item counts
- ✅ **URL State**: Filters persist in query params for shareable links
- ✅ **Optimistic Updates**: Instant approve/reject with rollback on error
- ✅ **Empty/Loading/Error States**: Polished, contextual UI states
- ✅ **Scroll Preservation**: Returns to exact scroll position after detail view

### 3. Quotation Detail Page
- ✅ **Full Quotation Data**: Client, amount, status, line items, totals
- ✅ **Line Items Breakdown**: SKU-level details with subtotal, GST (18%), freight
- ✅ **Editable Fields**: Manager-only inline editing (client name, amount)
- ✅ **Status Actions**: Approve/Reject with optional rejection reason
- ✅ **Real-time Validation**: Inline field validation with helpful error messages
- ✅ **Unsaved Changes Guard**: Confirmation dialog before navigating away
- ✅ **Status History Timeline**: Visual timeline of all status changes with timestamps
- ✅ **Print View**: Professional PDF-ready layout (separate route)

### 4. Comments & Replies System
- ✅ **Threaded Comments**: Nested replies up to 2 levels
- ✅ **Role-Based Visibility**: 
  - Comments visible to all
  - Replies visible only to same role (+ managers see all)
- ✅ **Lazy Loading**: Collapsed replies with "View replies (n)" toggle
- ✅ **Permissions**:
  - Manager: Post comments + replies
  - Sales Rep: Post comments only
  - Viewer: Read-only
- ✅ **Draft Auto-Save**: Comments auto-save every 2 seconds to localStorage
- ✅ **Draft Restoration**: Visual indicator when draft is restored

### 5. Performance & UX Optimizations
- ✅ **Optimistic Updates**: Immediate UI feedback with rollback on API errors
- ✅ **Debounced Search**: Reduced API calls with 300ms delay
- ✅ **React.memo**: All presentational components memoized
- ✅ **useCallback/useMemo**: Prevents unnecessary re-renders
- ✅ **Lazy Loading**: Comments/replies loaded on demand
- ✅ **Mock API Delay**: 1s simulated network delay for realistic UX

---

## 🎨 Product Sense Extras

These features demonstrate product thinking and attention to detail:

### 1. **Keyboard Shortcuts** (Power-user features)
| Key | Action | Context |
|-----|--------|---------|
| `/` | Focus search bar | Quotations list |
| `A` | Approve quotation | Detail (Manager only) |
| `R` | Reject quotation | Detail (Manager only) |
| `E` | Enter edit mode | Detail (Manager only) |
| `Esc` | Cancel editing | Detail (when editing) |

### 2. **URL-Driven State**
- All filters (search, status) persist in URL query params
- Shareable links maintain filter state
- Page reloads are resilient

### 3. **Inline Status History Timeline**
- Complete audit trail showing:
  - Who changed the status
  - When it was changed
  - Rejection reason (if applicable)
- Visual timeline with status-specific icons and colors

### 4. **Unsaved Changes Protection**
- Warns before navigating away from unsaved edits
- Prevents accidental data loss
- Works with browser back/forward navigation

### 5. **Smart Empty States**
- First-run experience explains quotations
- Contextual guidance based on filters
- "Clear Filters" action when no results

### 6. **Print-Friendly View**
- Clean, professional layout (`/quotations/:id/print`)
- Includes all details: line items, totals, status history
- Opens in new tab with auto-print

### 7. **Scroll Position Memory**
- Preserves exact scroll position when navigating to detail
- Seamless back navigation experience
- Uses sessionStorage for persistence

### 8. **Draft Persistence**
- Auto-saves comment drafts every 2 seconds
- Restores drafts when returning to page
- Visual "Draft restored" indicator

### 9. **Inline Validation**
- Real-time field validation
- Helpful, descriptive error messages (not just red borders)
- Prevents form submission with errors

### 10. **Rejection Reason Dialog**
- Optional reason field when rejecting quotations
- Stores reason in status history
- Displayed in timeline for transparency

---

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript (strict mode)
- **State Management**: Redux Toolkit with normalized state
- **Routing**: React Router v6+
- **Styling**: Tailwind CSS + shadcn/ui components
- **Notifications**: Sonner (toast notifications)
- **API**: In-app mock service with 1s delay

### Folder Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   ├── layout/         # TopBar, DashboardLayout
│   ├── StatusPill.tsx  # Status badges
│   ├── StatusTimeline.tsx
│   ├── EmptyState.tsx
│   └── LoadingSpinner.tsx
├── features/           # Feature-based modules
│   ├── auth/          # Authentication logic
│   │   ├── AuthGuard.tsx
│   │   └── authService.ts
│   └── quotations/    # Quotations feature
│       ├── hooks/     # useQuotations, useQuotationDetail
│       └── components/ # CommentsSection
├── lib/               # Utilities & helpers
│   ├── types.ts       # TypeScript definitions
│   ├── permissions.ts # Role-based permission logic
│   ├── storage.ts     # localStorage utilities
│   ├── mockApi.ts     # Mock API with 1s delay
│   └── utils.ts       # General utilities
├── pages/             # Route pages
│   ├── SignIn.tsx
│   ├── SignUp.tsx
│   ├── ForgotPassword.tsx
│   ├── QuotationsList.tsx
│   ├── QuotationDetail.tsx
│   └── QuotationPrint.tsx
├── store/             # Redux store
│   ├── index.ts       # Store configuration
│   ├── hooks.ts       # Typed useAppDispatch, useAppSelector
│   └── slices/
│       ├── authSlice.ts
│       └── quotationsSlice.ts
└── App.tsx            # Router & providers
```

---

## 🔐 Role-Based Permissions

### Permission Matrix

| Role | View | Search/Filter | Approve/Reject | Edit Details | Add Comment | Add Reply |
|------|------|---------------|----------------|--------------|-------------|-----------|
| **Manager** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Sales Rep** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Viewer** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Implementation Details
- **UI Gating**: Actions conditionally rendered using `getAvailableActions()` helper
- **Guard Routes**: `<AuthGuard>` wrapper protects authenticated routes
- **Reply Visibility**: 
  - Comments visible to all users
  - Replies visible only to users with same role as replier
  - Managers can see all replies

**Permission Helper Example:**
```typescript
export function getAvailableActions(role: Role, status: Status) {
  return {
    canApprove: role === 'manager' && status === 'Pending',
    canReject: role === 'manager' && status === 'Pending',
    canEdit: role === 'manager',
    canComment: role === 'manager' || role === 'sales_rep',
  };
}
```

---

## ⚡ Optimistic Updates & Rollback

### Strategy
1. **Immediate UI Update**: Update Redux state optimistically
2. **Show Loading Toast**: Inform user of ongoing action
3. **API Call**: Send request to mock API (1s delay)
4. **Success**: Dismiss loading, show success toast
5. **Error**: Rollback to previous state, show error toast

### Implementation
```typescript
// Optimistic update
const previousStatus = quotation.status;
dispatch(optimisticStatusUpdate({ id, status: 'Approved' }));
toast.loading('Approving quotation...');

try {
  await dispatch(updateQuotationStatus({ 
    id, 
    status: 'Approved',
    userInfo: { name: user.name, role: user.role }
  })).unwrap();
  
  toast.dismiss();
  toast.success('Quotation approved successfully');
} catch (error) {
  // Rollback on failure
  dispatch(rollbackStatusUpdate({ id, previousStatus }));
  toast.dismiss();
  toast.error('Failed to approve quotation');
}
```

**Benefits:**
- Instant UI feedback (feels faster)
- Automatic error recovery
- Consistent user experience

---

## 🧪 Mock API Layer

**Location**: `src/lib/mockApi.ts`

### Features
- ✅ Simulated 1s network delay
- ✅ Realistic error scenarios (10% failure rate)
- ✅ In-memory data persistence during session
- ✅ 5 sample quotations with varied states
- ✅ Full CRUD operations for quotations, comments, replies

### Available Endpoints
```typescript
// Quotations
GET    /quotations              // List (supports search, filter)
GET    /quotations/:id          // Single quotation
PATCH  /quotations/:id          // Update quotation
PATCH  /quotations/:id/status   // Update status

// Comments & Replies
POST   /quotations/:id/comments // Add comment
POST   /comments/:id/replies    // Add reply
```

### Sample Data Shape
```typescript
{
  id: "Q-101",
  client: "Acme Manufacturing Ltd.",
  amount: 36034.20,
  status: "Pending",
  last_updated: "2025-01-15T10:30:00Z",
  description: "Q1 2025 bulk order request",
  lineItems: [
    {
      sr: 1,
      item: "Corrugated Pipe 25mm PP",
      sku: "NFC25",
      qty: 500,
      unit: "M",
      rate: 24.50,
      amount: 12250
    }
  ],
  subtotal: 29690,
  gst: 5344.20,
  freight: 1000,
  comments: [...],
  statusHistory: [...]
}
```

---

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
    quotations: Quotation[],        // List view
    currentQuotation: Quotation | null,  // Detail view
    loading: boolean,
    error: string | null,
    commentsLoading: boolean,
    filters: {
      search: string,
      status: string
    },
    pagination: {
      currentPage: number,
      totalPages: number,
      itemsPerPage: number,
      totalItems: number
    }
  }
}
```

### Why Redux Toolkit?
- **Normalized State**: Efficient updates to quotations
- **Optimistic Updates**: Easy rollback with Redux actions
- **DevTools**: Time-travel debugging for complex workflows
- **Type Safety**: Full TypeScript support with typed hooks
- **Immer Integration**: Immutable updates with mutable syntax

---

## 🎨 Design System

### Color Palette
- **Primary**: Professional blue (#2563eb)
- **Status Colors**:
  - Pending: Yellow (#eab308)
  - Approved: Green (#16a34a)
  - Rejected: Red (#dc2626)
- **Neutrals**: Gray scale for text and backgrounds

### Status Pills
```css
.status-pending  → Yellow background, amber text
.status-approved → Green background, emerald text
.status-rejected → Red background, rose text
```

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 📝 Trade-offs & Design Decisions

### Current Approach

| Decision | Rationale | Alternative Considered |
|----------|-----------|------------------------|
| **Pagination** | Better for large datasets, predictable UX | Infinite scroll (harder to "find" items) |
| **Redux Toolkit** | Normalized state ideal for optimistic updates | Zustand (simpler, but less structure) |
| **Mock API with delay** | Realistic UX testing, error handling | json-server (requires separate process) |
| **localStorage for auth** | Simple demo, works offline | Real JWT + httpOnly cookies (production) |
| **Role switcher** | Easy demo of permissions | Separate test accounts (less convenient) |

### Future Enhancements
- [ ] WebSocket for real-time collaborative updates
- [ ] Conflict resolution UI for concurrent edits
- [ ] Dark mode toggle
- [ ] Advanced filters (date range, amount range)
- [ ] Bulk actions (approve/reject multiple)
- [ ] Email notifications
- [ ] Offline-first with service worker
- [ ] Unit tests for permission helpers and Redux slices
- [ ] E2E tests for critical flows

---

## 🔍 Testing Approach

While this demo focuses on architecture and UX, the code is structured for testability:

**Recommended Test Coverage:**
1. **Unit Tests**: 
   - Permission helpers (`getAvailableActions`, `canAddComment`, etc.)
   - Utility functions (formatters, validators)
2. **Integration Tests**:
   - Redux slices (actions, reducers)
   - Custom hooks (`useQuotations`, `useQuotationDetail`)
3. **E2E Tests**:
   - Auth flow (sign in → role switch → sign out)
   - Approve/reject workflow with rollback
   - Comment/reply creation

---

## 📖 User Guide

### Getting Started
1. **Sign In** with default credentials (or create new account)
2. **Browse Quotations** - Try search (press `/`) and filters
3. **Switch Roles** - Use topbar dropdown to test different permissions
4. **View Details** - Click any quotation row
5. **Try Keyboard Shortcuts** - `A`, `R`, `E` on detail page (if manager)

### Manager Workflow
1. View pending quotations
2. Click quotation to review details
3. Press `A` to approve OR `R` to reject (with optional reason)
4. Edit details by pressing `E` or clicking "Edit"
5. Add comments and replies to communicate with team

### Sales Rep Workflow
1. View all quotations
2. Add comments to provide context
3. Monitor status changes via timeline

### Viewer Workflow
1. Read-only access to all quotations
2. View status history and public comments

---

## 🌟 Highlights

This application demonstrates:
- ✅ **Production-grade architecture** with clear separation of concerns
- ✅ **Enterprise UX patterns** (optimistic updates, keyboard shortcuts, draft persistence)
- ✅ **Role-based security** with multi-level permission checks
- ✅ **Performance optimization** (memoization, debouncing, lazy loading)
- ✅ **Accessibility basics** (keyboard navigation, ARIA labels, focus management)
- ✅ **Responsive design** that works on mobile, tablet, and desktop
- ✅ **Type safety** with strict TypeScript throughout
- ✅ **Clean code** with consistent patterns and naming conventions

---

**Built with ❤️ for Pactle** | React 18 • TypeScript • Redux Toolkit • Tailwind CSS
