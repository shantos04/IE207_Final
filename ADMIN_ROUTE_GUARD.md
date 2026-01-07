# 🛡️ Admin Route Guard

## Tổng quan

**AdminRoute** là một component bảo vệ (guard) để đảm bảo chỉ có người dùng có quyền quản trị mới có thể truy cập các trang admin.

## 🔐 2 Lớp Bảo vệ

### 1️⃣ Authentication Check (Kiểm tra đăng nhập)
```typescript
if (!isAuthenticated || !user) {
    return <Navigate to="/login" />
}
```
- Kiểm tra user đã đăng nhập chưa
- Nếu chưa → Redirect về `/login`

### 2️⃣ Authorization Check (Kiểm tra quyền)
```typescript
const authorizedRoles = ['admin', 'manager', 'staff'];
const isAuthorized = authorizedRoles.includes(user.role);

if (!isAuthorized) {
    return <Navigate to="/" />
}
```
- Kiểm tra user có role phù hợp không
- Chỉ cho phép: `admin`, `manager`, `staff`
- Từ chối: `customer`
- Nếu không có quyền → Redirect về `/` + Toast error

## 📋 Flow Chart

```
User truy cập /admin/dashboard
         ↓
   [AdminRoute Guard]
         ↓
   Is Loading? → YES → Show loading spinner
         ↓ NO
   Is Authenticated? → NO → Redirect to /login
         ↓ YES
   Is Authorized? → NO → Redirect to / + Toast error
         ↓ YES
   ✅ Allow access to Admin Dashboard
```

## 🎯 Use Cases

### ✅ Case 1: Admin đăng nhập
```
User: admin@craftui.com
Role: admin
Action: Truy cập /admin/dashboard
Result: ✅ Cho phép truy cập
```

### ✅ Case 2: Manager đăng nhập
```
User: manager@company.com
Role: manager
Action: Truy cập /admin/products
Result: ✅ Cho phép truy cập
```

### ❌ Case 3: Customer đăng nhập
```
User: khachhang@craftui.com
Role: customer
Action: Truy cập /admin/dashboard
Result: ❌ Redirect to / + Toast: "Bạn không có quyền..."
```

### ❌ Case 4: Chưa đăng nhập
```
User: Anonymous
Action: Truy cập /admin/orders
Result: ❌ Redirect to /login
```

## 🔧 Implementation

### 1. AdminRoute Component
File: [`src/components/auth/AdminRoute.tsx`](../src/components/auth/AdminRoute.tsx)

```typescript
export default function AdminRoute({ children }: AdminRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Loading state
    if (isLoading) {
        return <LoadingSpinner />;
    }

    // Check authentication
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check authorization
    const authorizedRoles = ['admin', 'manager', 'staff'];
    const isAuthorized = authorizedRoles.includes(user.role);

    if (!isAuthorized) {
        toast.error('Bạn không có quyền truy cập trang quản trị!');
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
```

### 2. Usage in App.tsx
File: [`src/App.tsx`](../src/App.tsx)

```typescript
<Route
    path="/admin"
    element={
        <AdminRoute>
            <DashboardLayout />
        </AdminRoute>
    }
>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<DashboardHome />} />
    <Route path="products" element={<ProductsPage />} />
    {/* ... other admin routes */}
</Route>
```

## 🆚 AdminRoute vs ProtectedRoute

| Feature | ProtectedRoute | AdminRoute |
|---------|---------------|------------|
| **Check Authentication** | ✅ Yes | ✅ Yes |
| **Check Authorization** | ❌ No | ✅ Yes |
| **Check Role** | ❌ No | ✅ Yes |
| **Use For** | Any protected pages | Admin-only pages |
| **Redirect Unauthorized** | - | Home page + Toast |

## 🧪 Testing

### Test 1: Admin Access
```bash
1. Login as admin@craftui.com / 123456
2. Navigate to http://localhost:5173/admin/dashboard
3. Expected: ✅ Dashboard loads successfully
```

### Test 2: Customer Blocked
```bash
1. Login as khachhang@craftui.com / 123456
2. Navigate to http://localhost:5173/admin/dashboard
3. Expected: ❌ Redirect to / with error toast
```

### Test 3: Guest Blocked
```bash
1. Logout or open incognito
2. Navigate to http://localhost:5173/admin/orders
3. Expected: ❌ Redirect to /login
```

### Test 4: Direct URL Access
```bash
1. Login as customer
2. Type /admin/products in address bar
3. Press Enter
4. Expected: ❌ Blocked and redirected to /
```

## 🎨 UI States

### Loading State
```tsx
<div className="min-h-screen flex items-center justify-center">
    <div className="w-16 h-16 border-4 border-blue-600 
                    border-t-transparent rounded-full animate-spin">
    </div>
    <p>Đang tải...</p>
</div>
```

### Error Toast
```typescript
toast.error('Bạn không có quyền truy cập trang quản trị!');
```

## 🔒 Security Features

### 1. Role-based Access Control (RBAC)
- Whitelist approach: Chỉ cho phép roles cụ thể
- Dễ mở rộng: Thêm role mới vào array `authorizedRoles`

### 2. Client-side Protection
- Ngăn chặn navigation không hợp lệ
- Show error message rõ ràng
- Tự động redirect về trang phù hợp

### 3. State Preservation
- Save attempted URL in `location.state`
- Redirect back sau khi login thành công

## 📝 Best Practices

### ✅ DO:
```typescript
// Use AdminRoute for admin pages
<Route path="/admin" element={<AdminRoute><Layout /></AdminRoute>}>
    ...
</Route>

// Check multiple roles
const authorizedRoles = ['admin', 'manager', 'staff'];
```

### ❌ DON'T:
```typescript
// Don't use regular ProtectedRoute for admin
<Route path="/admin" element={<ProtectedRoute><Layout /></ProtectedRoute>}>

// Don't hardcode single role
if (user.role === 'admin') // ❌ Not scalable
```

## 🔄 Future Enhancements

### 1. Permission-based Access
```typescript
// Instead of role-based
const hasPermission = user.permissions.includes('view_dashboard');
```

### 2. Route-specific Permissions
```typescript
<AdminRoute requiredPermissions={['edit_products']}>
    <ProductsPage />
</AdminRoute>
```

### 3. Audit Logging
```typescript
// Log unauthorized access attempts
logSecurityEvent({
    type: 'UNAUTHORIZED_ACCESS',
    user: user.email,
    attemptedUrl: location.pathname,
});
```

## 🐛 Troubleshooting

### Issue 1: Still redirecting after login
**Solution:** Check if user object is properly saved in localStorage/context

### Issue 2: Infinite redirect loop
**Solution:** Make sure routes don't redirect to themselves

### Issue 3: Role not checked
**Solution:** Verify user.role is included in authorizedRoles array

## ✨ Files Modified/Created

- ✅ Created: [`src/components/auth/AdminRoute.tsx`](../src/components/auth/AdminRoute.tsx)
- ✅ Created: [`src/pages/ForbiddenPage.tsx`](../src/pages/ForbiddenPage.tsx)
- ✅ Updated: [`src/App.tsx`](../src/App.tsx) - Use AdminRoute instead of ProtectedRoute

## 🎉 Summary

**AdminRoute** provides:
- ✅ Two-layer protection (Authentication + Authorization)
- ✅ Role-based access control
- ✅ Clear error messages
- ✅ Automatic redirects
- ✅ Loading states
- ✅ Scalable design

**Now your admin routes are properly protected!** 🛡️
