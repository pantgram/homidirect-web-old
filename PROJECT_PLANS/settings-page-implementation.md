# Settings Page Implementation Plan

## Overview
Create a comprehensive Settings page for HomiDirect with change password, notification preferences, language selection, and dark/light theme toggle.

---

## Current State

**Database (users table):**
- ✅ Basic user fields (id, name, email, role, password)
- ✅ Password reset token/expires fields
- ❌ No notification preference columns

**Backend:**
- ✅ Reset password endpoint (`POST /auth/reset-password` - requires email token)
- ✅ User update endpoint (`PATCH /users/:id`)
- ❌ No change password endpoint for authenticated users
- ❌ No notification preferences support

**Frontend:**
- ✅ `LanguageContext` working (English/Greek)
- ✅ `next-themes` installed
- ✅ Dark mode CSS configured (`index.css`)
- ❌ No ThemeProvider wrapper
- ❌ No Settings page exists

---

## Implementation Phases

### **Phase 1: Backend - Database & Schema**

#### 1.1 Database Migration
**File:** `apps/api/drizzle/0010_add_notification_preferences.sql`

```sql
-- Add notification preference columns to users table
ALTER TABLE "users" ADD COLUMN "email_notifications_enabled" boolean DEFAULT true NOT NULL;
ALTER TABLE "users" ADD COLUMN "marketing_emails_enabled" boolean DEFAULT true NOT NULL;
```

#### 1.2 Update Users Model
**File:** `apps/api/src/modules/users/users.model.ts`
- Add `emailNotificationsEnabled` field
- Add `marketingEmailsEnabled` field
- Update TypeScript types

#### 1.3 Update User Schema
**File:** `apps/api/src/schemas/user.schema.ts`
- Add `changePasswordSchema`:
  ```typescript
  export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
  });
  ```

#### 1.4 Update Users Service
**File:** `apps/api/src/modules/users/users.service.ts`
- Add `changePassword` method:
  1. Fetch user with password
  2. Verify current password using `comparePasswords()`
  3. Hash new password
  4. Update user record

#### 1.5 Update Users Controller
**File:** `apps/api/src/modules/users/users.controller.ts`
- Add `changePassword` controller method

#### 1.6 Update Users Routes
**File:** `apps/api/src/modules/users/users.routes.ts`
- Add `POST /users/:id/change-password` route with:
  - Authentication middleware
  - User ownership verification
  - Request body validation
  - Rate limiting (5 per 15 minutes)

---

### **Phase 2: Frontend - Types & API**

#### 2.1 Update Shared Types
**File:** `packages/shared/src/types/user.ts`
- Add `emailNotificationsEnabled?: boolean`
- Add `marketingEmailsEnabled?: boolean`

#### 2.2 Update Auth Types
**File:** `packages/shared/src/types/auth.ts`
- Add `ChangePasswordRequest` interface:
  ```typescript
  export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
  }
  ```

#### 2.3 Create Settings Hook
**File:** `apps/web/src/hooks/useSettings.ts`
```typescript
export function useChangePassword() {
  // Mutation for changing password
}

export function useUpdatePreferences() {
  // Mutation for updating notification preferences
}
```

#### 2.4 Update Users API
**File:** `apps/web/src/api/users.ts`
- Add `changePassword(id, data)` method
- Add `updatePreferences(id, data)` method

---

### **Phase 3: Frontend - Theme Provider**

#### 3.1 Create ThemeProvider
**File:** `apps/web/src/contexts/ThemeContext.tsx`
```typescript
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

export const useTheme = () => {
  const theme = useNextTheme();
  // ...
};
```

#### 3.2 Wrap App
**File:** `apps/web/src/App.tsx`
- Wrap `TooltipProvider` with `ThemeProvider`

---

### **Phase 4: Frontend - Settings Page**

#### 4.1 Create Settings Page
**File:** `apps/web/src/pages/Settings.tsx`

**Structure:**
- Use Tabs component for organized sections:
  1. **General Tab**
     - Language selector (radio buttons or select)
     - Theme toggle (Light/Dark/System)
  2. **Security Tab**
     - Change password form:
       - Current password input
       - New password input
       - Confirm new password input
     - Link to forgot password page
  3. **Notifications Tab**
     - Email notifications switch (system emails like password reset)
     - Marketing emails switch (promotional content)

**Components Used:**
- `Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Label`, `Input`, `Switch`
- `Button`
- `Toast` for success/error feedback

**State Management:**
- Password form state
- Notification preferences state
- Loading states for mutations

#### 4.2 Add Route
**File:** `apps/web/src/App.tsx`
- Add `<Route path="/settings" element={<Settings />} />`

#### 4.3 Update Navigation
**File:** `apps/web/src/components/Navigation.tsx`
- Ensure Settings link navigates to `/settings`

---

### **Phase 5: Translations**

#### 5.1 Add Translation Keys
**File:** `apps/web/src/contexts/LanguageContext.tsx`

**English keys:**
```typescript
"settings.title": "Settings",
"settings.general": "General",
"settings.security": "Security",
"settings.notifications": "Notifications",
"settings.language": "Language",
"settings.theme": "Theme",
"settings.themeLight": "Light",
"settings.themeDark": "Dark",
"settings.themeSystem": "System",
"settings.changePassword": "Change Password",
"settings.currentPassword": "Current Password",
"settings.newPassword": "New Password",
"settings.confirmPassword": "Confirm New Password",
"settings.forgotPassword": "Forgot your password?",
"settings.emailNotifications": "Email Notifications",
"settings.emailNotificationsDesc": "Receive important updates about your account",
"settings.marketingEmails": "Marketing Emails",
"settings.marketingEmailsDesc": "Receive promotional content and offers",
"settings.passwordChanged": "Password changed successfully",
"settings.passwordChangedError": "Failed to change password",
"settings.invalidCurrentPassword": "Current password is incorrect",
"settings.passwordsDoNotMatch": "Passwords do not match",
"settings.preferencesUpdated": "Preferences updated successfully",
"settings.preferencesUpdateError": "Failed to update preferences",
```

**Greek translations** for all keys above

---

## File Changes Summary

### Backend (6 files)
1. `apps/api/drizzle/0010_add_notification_preferences.sql` - NEW
2. `apps/api/src/modules/users/users.model.ts` - MODIFIED
3. `apps/api/src/schemas/user.schema.ts` - MODIFIED
4. `apps/api/src/modules/users/users.service.ts` - MODIFIED
5. `apps/api/src/modules/users/users.controller.ts` - MODIFIED
6. `apps/api/src/modules/users/users.routes.ts` - MODIFIED

### Frontend - Types & API (4 files)
1. `packages/shared/src/types/user.ts` - MODIFIED
2. `packages/shared/src/types/auth.ts` - MODIFIED
3. `apps/web/src/hooks/useSettings.ts` - NEW
4. `apps/web/src/api/users.ts` - MODIFIED

### Frontend - UI & Features (4 files)
1. `apps/web/src/contexts/ThemeContext.tsx` - NEW
2. `apps/web/src/App.tsx` - MODIFIED
3. `apps/web/src/pages/Settings.tsx` - NEW
4. `apps/web/src/contexts/LanguageContext.tsx` - MODIFIED

---

## Testing Checklist

### Backend
- [ ] Database migration runs successfully
- [ ] Change password endpoint validates current password
- [ ] Change password endpoint rejects incorrect current password
- [ ] Change password endpoint rejects weak passwords
- [ ] Notification preferences update correctly
- [ ] Rate limiting works for change password

### Frontend
- [ ] Settings page renders all tabs
- [ ] Language selector works and persists
- [ ] Theme toggle works and applies to all pages
- [ ] Change password form validates inputs
- [ ] Change password shows error on wrong current password
- [ ] Change password shows success on completion
- [ ] Notification toggles save correctly
- [ ] Page is accessible via navigation
- [ ] Translations work for both languages
- [ ] Responsive design works on mobile

---

## Questions Before Implementation

1. **Notification Scope**: For phase 1, should we only implement email notifications (password resets, security alerts) and marketing emails? Or do you want:
   - Property alerts (new listings matching saved searches)
   - Message notifications
   - Booking updates?

2. **Reset Password Link**: Should settings page link to existing `/forgot-password` flow, or do you want a different UX?

3. **Change Password Security**: Should we:
   - Log out all sessions after password change?
   - Require email confirmation?
   - Just change password immediately?

4. **Default Preferences**: Should:
   - Email notifications be enabled by default?
   - Marketing emails be enabled by default?
   - Users opt-in or opt-out of marketing?
