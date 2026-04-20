# Environment Variables & Quick Reference Guide

**Purpose:** Comprehensive reference for all environment variables and code snippets needed to implement the OpenExcel authentication pattern in a new Static Web App.

---

## Part 1: Environment Variables Reference

### Section 1.1: OAuth Configuration Variables

These variables control OAuth setup and token handling.

#### VITE_AZURE_AD_CLIENT_ID
**Type:** String (GUID)  
**Required:** Yes (if using Azure AD OAuth)  
**Description:** The Application (Client) ID from your Entra ID App Registration  
**Example:**
```bash
VITE_AZURE_AD_CLIENT_ID=12345678-90ab-cdef-1234-567890abcdef
```
**Where to find:** Azure Portal → Entra ID → App Registrations → Your App → Overview → Application (client) ID

---

#### VITE_AZURE_AD_TENANT_ID
**Type:** String (GUID)  
**Required:** Yes (if using Azure AD OAuth)  
**Description:** Your Azure AD tenant ID (also called Directory ID)  
**Example:**
```bash
VITE_AZURE_AD_TENANT_ID=87654321-ba98-fedc-4321-0fedcba98765
```
**Where to find:** Azure Portal → Entra ID → App Registrations → Your App → Overview → Directory (tenant) ID

---

#### VITE_AZURE_AD_AUTHORITY
**Type:** String (URL)  
**Required:** Yes (if using Azure AD OAuth)  
**Description:** OIDC authority endpoint for token requests  
**Computed from:** `https://login.microsoftonline.com/{VITE_AZURE_AD_TENANT_ID}/v2.0`  
**Example:**
```bash
VITE_AZURE_AD_AUTHORITY=https://login.microsoftonline.com/87654321-ba98-fedc-4321-0fedcba98765/v2.0
```

---

#### VITE_AZURE_AD_REDIRECT_URI
**Type:** String (URL)  
**Required:** Yes (if using Azure AD OAuth)  
**Description:** OAuth redirect URI (must match App Registration configuration)  
**Production Example:**
```bash
VITE_AZURE_AD_REDIRECT_URI=https://your-app.azurestaticapps.net/auth/callback
```
**Development Example:**
```bash
VITE_AZURE_AD_REDIRECT_URI=http://localhost:3000/auth/callback
```
**Important:** This URI **must exactly match** what's configured in the App Registration

---

#### VITE_AZURE_AD_SCOPES
**Type:** String (space-separated)  
**Required:** Yes (if using Azure AD OAuth)  
**Description:** OAuth scopes to request during authentication  
**Common Configuration:**
```bash
VITE_AZURE_AD_SCOPES=User.Read profile email offline_access
```
**Scope Meanings:**
- `User.Read` — Read basic user profile information
- `profile` — Include profile claims in ID token
- `email` — Include email address in token claims
- `offline_access` — Enable refresh token (required for automatic token refresh)

---

### Section 1.2: Application & Deployment Variables

#### VITE_APP_URL
**Type:** String (URL)  
**Required:** No (optional)  
**Description:** Base URL of your SWA application  
**Production Example:**
```bash
VITE_APP_URL=https://your-app.azurestaticapps.net
```
**Development Example:**
```bash
VITE_APP_URL=http://localhost:3000
```
**Usage:** Used for building URLs, redirects, and API endpoints

---

#### VITE_API_URL
**Type:** String (URL)  
**Required:** No (optional)  
**Description:** Base URL of your backend API (if separate from SWA)  
**Example:**
```bash
VITE_API_URL=https://your-backend-api.azurewebsites.net
```
**Usage:** Prepended to all backend API requests

---

### Section 1.3: Monitoring & Observability Variables

#### VITE_DD_CLIENT_TOKEN
**Type:** String  
**Required:** No (optional, for Datadog monitoring)  
**Description:** Datadog Real User Monitoring (RUM) client token  
**Example:**
```bash
VITE_DD_CLIENT_TOKEN=pub12345678abcdefghijklmnopqrst
```
**Where to find:** Datadog dashboard → RUM Application → Setup

---

#### VITE_DD_APP_ID
**Type:** String (GUID)  
**Required:** No (optional, for Datadog monitoring)  
**Description:** Datadog RUM Application ID  
**Example:**
```bash
VITE_DD_APP_ID=12345678-90ab-cdef-1234-567890abcdef
```
**Where to find:** Datadog dashboard → RUM Application → Setup

---

#### VITE_DD_SITE
**Type:** String  
**Required:** No (optional, defaults to `datadoghq.com`)  
**Description:** Datadog site/region  
**Valid Values:** `datadoghq.com`, `datadoghq.eu`, `us3.datadoghq.com`, `us5.datadoghq.com`  
**Example:**
```bash
VITE_DD_SITE=datadoghq.eu
```

---

#### VITE_DD_SERVICE
**Type:** String  
**Required:** No (optional, defaults to app name)  
**Description:** Service name for Datadog RUM  
**Example:**
```bash
VITE_DD_SERVICE=excel-mate
```

---

#### VITE_DD_ENV
**Type:** String  
**Required:** No (optional, defaults to environment)  
**Description:** Environment name for Datadog  
**Valid Values:** `development`, `staging`, `production`  
**Example:**
```bash
VITE_DD_ENV=production
```

---

#### VITE_DD_VERSION
**Type:** String  
**Required:** No (optional means app version)  
**Description:** Application version for Datadog RUM  
**Example:**
```bash
VITE_DD_VERSION=1.2.3
```

---

## Part 2: Complete `.env` Template Files

### Development `.env.local`

```bash
# ============================================
# OAuth Configuration (Azure AD)
# ============================================
VITE_AZURE_AD_CLIENT_ID=your-dev-client-id
VITE_AZURE_AD_TENANT_ID=your-tenant-id
VITE_AZURE_AD_AUTHORITY=https://login.microsoftonline.com/your-tenant-id/v2.0
VITE_AZURE_AD_REDIRECT_URI=http://localhost:3000/auth/callback
VITE_AZURE_AD_SCOPES=User.Read profile email offline_access

# ============================================
# Application URLs (Development)
# ============================================
VITE_APP_URL=http://localhost:3000
VITE_API_URL=http://localhost:7071

# ============================================
# Monitoring (Optional - Development)
# ============================================
VITE_DD_CLIENT_TOKEN=pub_dev-token
VITE_DD_APP_ID=your-dev-app-id
VITE_DD_SITE=datadoghq.eu
VITE_DD_SERVICE=excel-mate-dev
VITE_DD_ENV=development
VITE_DD_VERSION=0.0.1
```

### Staging `.env.staging`

```bash
# ============================================
# OAuth Configuration (Azure AD)
# ============================================
VITE_AZURE_AD_CLIENT_ID=your-staging-client-id
VITE_AZURE_AD_TENANT_ID=your-tenant-id
VITE_AZURE_AD_AUTHORITY=https://login.microsoftonline.com/your-tenant-id/v2.0
VITE_AZURE_AD_REDIRECT_URI=https://staging-app.azurestaticapps.net/auth/callback
VITE_AZURE_AD_SCOPES=User.Read profile email offline_access

# ============================================
# Application URLs (Staging)
# ============================================
VITE_APP_URL=https://staging-app.azurestaticapps.net
VITE_API_URL=https://staging-backend-api.azurewebsites.net

# ============================================
# Monitoring (Staging)
# ============================================
VITE_DD_CLIENT_TOKEN=pub_staging-token
VITE_DD_APP_ID=your-staging-app-id
VITE_DD_SITE=datadoghq.eu
VITE_DD_SERVICE=excel-mate-staging
VITE_DD_ENV=staging
VITE_DD_VERSION=1.0.0-beta.1
```

### Production `.env.production`

```bash
# ============================================
# OAuth Configuration (Azure AD)
# ============================================
VITE_AZURE_AD_CLIENT_ID=your-production-client-id
VITE_AZURE_AD_TENANT_ID=your-tenant-id
VITE_AZURE_AD_AUTHORITY=https://login.microsoftonline.com/your-tenant-id/v2.0
VITE_AZURE_AD_REDIRECT_URI=https://excel-mate.azurestaticapps.net/auth/callback
VITE_AZURE_AD_SCOPES=User.Read profile email offline_access

# ============================================
# Application URLs (Production)
# ============================================
VITE_APP_URL=https://excel-mate.azurestaticapps.net
VITE_API_URL=https://excel-mate-api.azurewebsites.net

# ============================================
# Monitoring (Production)
# ============================================
VITE_DD_CLIENT_TOKEN=pub_prod-token
VITE_DD_APP_ID=your-prod-app-id
VITE_DD_SITE=datadoghq.eu
VITE_DD_SERVICE=excel-mate
VITE_DD_ENV=production
VITE_DD_VERSION=1.0.0
```

---

## Part 3: Token Storage Schema Reference

### localStorage Key Structure

```
Key: {localStoragePrefix}-oauth-credentials
Value:
{
  "anthropic": {
    "refresh": "long-lived-refresh-token-string",
    "access": "short-lived-access-token-string",
    "expires": 1713619200000  // Unix timestamp in milliseconds
  },
  "openai-codex": {
    "refresh": "...",
    "access": "...",
    "expires": 1713619200000
  }
}
```

### ProviderConfig Storage

```
Key: {localStoragePrefix}-provider-config
Value:
{
  "provider": "anthropic",
  "apiKey": "access_token_or_api_key",
  "model": "claude-3-5-sonnet-20241022",
  "authMethod": "oauth",
  "useProxy": false,
  "proxyUrl": "",
  "thinking": "none",
  "followMode": true,
  "expandToolCalls": false,
  "apiType": "",
  "customBaseUrl": ""
}
```

---

## Part 4: Code Snippets

### Snippet 1: MSAL Configuration Object

```typescript
import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_AD_CLIENT_ID,
    authority: import.meta.env.VITE_AZURE_AD_AUTHORITY,
    redirectUri: import.meta.env.VITE_AZURE_AD_REDIRECT_URI,
    postLogoutRedirectUri: import.meta.env.VITE_APP_URL,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    allowRedirectInIframe: false,
    loggerOptions: {
      loggerCallback: (logLevel, message, containsPii) => {
        if (!containsPii) {
          console.log(`[MSAL ${logLevel}]`, message);
        }
      },
      piiLoggingEnabled: false,
      correlationId: undefined,
    },
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);
```

---

### Snippet 2: Handle OAuth Redirect on App Startup

```typescript
import { msalInstance } from "./msal-config";

async function initializeApp() {
  try {
    // Handle the redirect from OAuth callback
    const response = await msalInstance.handleRedirectPromise();
    
    if (response) {
      console.log("Login succeeded", response);
      // User was redirected back from OAuth provider with tokens
      // Tokens are automatically cached by MSAL
    } else {
      // No redirect occurred, check if user is already logged in
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length === 0) {
        console.log("No user currently logged in");
      } else {
        console.log("User already logged in:", accounts[0].username);
      }
    }
  } catch (error) {
    console.error("MSAL initialization error:", error);
  }
}

initializeApp();
```

---

### Snippet 3: Login with Popup

```typescript
import { msalInstance } from "./msal-config";

export async function loginWithPopup() {
  const scopes = import.meta.env.VITE_AZURE_AD_SCOPES.split(" ");
  
  try {
    const response = await msalInstance.loginPopup({
      scopes: scopes,
      prompt: "select_account", // Force account selection
    });
    
    console.log("Login successful", response);
    return response;
  } catch (error) {
    if ((error as any).errorCode === "user_cancelled") {
      console.log("User cancelled login");
    } else {
      console.error("Login failed:", error);
    }
    throw error;
  }
}
```

---

### Snippet 4: Acquire Access Token (with Silent Fallback)

```typescript
import { msalInstance } from "./msal-config";

export async function getAccessToken(): Promise<string | null> {
  const accounts = msalInstance.getAllAccounts();
  
  if (accounts.length === 0) {
    console.log("No account currently signed in");
    return null;
  }
  
  const scopes = import.meta.env.VITE_AZURE_AD_SCOPES.split(" ");
  
  try {
    // Try silent token acquisition first
    const response = await msalInstance.acquireTokenSilent({
      scopes: scopes,
      account: accounts[0],
    });
    
    console.log("Token acquired silently");
    return response.accessToken;
  } catch (silentError) {
    // If silent acquisition fails, try interactive
    console.log("Silent token acquisition failed, attempting interactive");
    
    try {
      const response = await msalInstance.acquireTokenPopup({
        scopes: scopes,
      });
      
      console.log("Token acquired interactively");
      return response.accessToken;
    } catch (interactiveError) {
      console.error("Token acquisition failed:", interactiveError);
      return null;
    }
  }
}
```

---

### Snippet 5: Logout

```typescript
import { msalInstance } from "./msal-config";

export async function logout() {
  const accounts = msalInstance.getAllAccounts();
  
  if (accounts.length === 0) {
    console.log("No account to log out");
    return;
  }
  
  try {
    await msalInstance.logoutPopup({
      account: accounts[0],
      mainWindowRedirectUri: import.meta.env.VITE_APP_URL,
    });
    
    console.log("Logout successful");
  } catch (error) {
    console.error("Logout failed:", error);
  }
}
```

---

### Snippet 6: API Call with Bearer Token

```typescript
import { getAccessToken } from "./auth";

export async function callBackendAPI(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = await getAccessToken();
  
  if (!token) {
    throw new Error("No access token available");
  }
  
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  
  const url = `${import.meta.env.VITE_API_URL}${endpoint}`;
  
  return fetch(url, {
    ...options,
    headers,
  });
}
```

---

### Snippet 7: React Hook for Authentication State

```typescript
import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "./auth";

export function useAuthState() {
  const { accounts } = useMsal();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const isAuthenticated = accounts.length > 0;
  const user = isAuthenticated ? accounts[0] : null;
  
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      getAccessToken()
        .then((accessToken) => setToken(accessToken))
        .catch((error) => console.error("Token fetch failed:", error))
        .finally(() => setIsLoading(false));
    } else {
      setToken(null);
    }
  }, [isAuthenticated]);
  
  return {
    isAuthenticated,
    user,
    token,
    isLoading,
  };
}
```

---

### Snippet 8: Svelte Component for Login/Logout

```svelte
<script lang="ts">
  import { useMsal } from "@azure/msal-react";
  import { loginWithPopup, logout } from "./auth";
  
  let isLoading = false;
  
  const { accounts } = useMsal();
  $: isAuthenticated = $accounts.length > 0;
  $: displayName = isAuthenticated ? $accounts[0].name : "Guest";
  
  async function handleLogin() {
    isLoading = true;
    try {
      await loginWithPopup();
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      isLoading = false;
    }
  }
  
  async function handleLogout() {
    isLoading = true;
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="auth-container">
  {#if isAuthenticated}
    <span>Welcome, {displayName}!</span>
    <button on:click={handleLogout} disabled={isLoading}>
      {isLoading ? "Logging out..." : "Logout"}
    </button>
  {:else}
    <button on:click={handleLogin} disabled={isLoading}>
      {isLoading ? "Logging in..." : "Login"}
    </button>
  {/if}
</div>

<style>
  .auth-container {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
</style>
```

---

### Snippet 9: Backend JWT Validation (Azure Function)

```typescript
import { Context, HttpRequest } from "@azure/functions";
import { jwtVerify } from "jose";
import { createRemoteJWKSet } from "jose";

export default async function validateToken(
  context: Context,
  req: HttpRequest,
): Promise<void> {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader?.startsWith("Bearer ")) {
    context.res = {
      status: 401,
      jsonBody: { error: "Missing or invalid Authorization header" },
    };
    return;
  }
  
  const token = authHeader.substring(7);
  const tenantId = process.env.AZURE_AD_TENANT_ID;
  const clientId = process.env.AZURE_AD_CLIENT_ID;
  
  try {
    // Create JWKS client
    const JWKS = createRemoteJWKSet(
      new URL(
        `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
      ),
    );
    
    // Verify token
    const verified = await jwtVerify(token, JWKS, {
      audience: clientId,
      issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
    });
    
    context.res = {
      status: 200,
      jsonBody: {
        valid: true,
        claims: verified.payload,
      },
    };
  } catch (error) {
    context.res = {
      status: 401,
      jsonBody: {
        error: "Token validation failed",
        message: (error as Error).message,
      },
    };
  }
}
```

---

### Snippet 10: staticwebapp.config.json Configuration

```json
{
  "auth": {
    "identityProviders": {
      "azureActiveDirectory": {
        "registration": {
          "openIdIssuer": "https://login.microsoftonline.com/{tenant-id}/v2.0",
          "clientIdSettingName": "AZURE_CLIENT_ID",
          "clientSecretSettingName": "AZURE_CLIENT_SECRET"
        },
        "login": {
          "loginParameters": ["scope=User.Read profile email offline_access"],
          "post_logout_redirect_uri": "/"
        }
      }
    }
  },
  "routes": [
    {
      "route": "/auth/*",
      "allowedRoles": ["authenticated"],
      "methods": ["GET", "POST"]
    },
    {
      "route": "/api/*",
      "allowedRoles": ["authenticated"],
      "methods": ["GET", "POST", "PUT", "DELETE"]
    },
    {
      "route": "/admin/*",
      "allowedRoles": ["admin"],
      "methods": ["GET", "POST"]
    },
    {
      "route": "/*",
      "serve": "index.html",
      "statusCode": 200
    }
  ],
  "navigationFallback": {
    "rewrite": "index.html",
    "exclude": ["/images/*", "/css/*"]
  }
}
```

---

## Part 5: Environment Variable Checklist

Before deploying to production, verify all variables are set:

### Development (localhost)
- [ ] `VITE_AZURE_AD_CLIENT_ID` — Dev client ID
- [ ] `VITE_AZURE_AD_TENANT_ID` — Your tenant ID
- [ ] `VITE_AZURE_AD_AUTHORITY` — Computed from tenant ID
- [ ] `VITE_AZURE_AD_REDIRECT_URI=http://localhost:3000/auth/callback`
- [ ] `VITE_AZURE_AD_SCOPES` — OAuth scopes
- [ ] `VITE_APP_URL=http://localhost:3000`
- [ ] `VITE_API_URL=http://localhost:7071`

### Staging
- [ ] `VITE_AZURE_AD_CLIENT_ID` — Staging client ID
- [ ] `VITE_AZURE_AD_REDIRECT_URI` — Staging SWA domain with `/auth/callback`
- [ ] `VITE_APP_URL` — Staging SWA domain
- [ ] `VITE_API_URL` — Staging API domain

### Production
- [ ] `VITE_AZURE_AD_CLIENT_ID` — Production client ID
- [ ] `VITE_AZURE_AD_REDIRECT_URI` — Production SWA domain with `/auth/callback`
- [ ] `VITE_APP_URL` — Production SWA domain
- [ ] `VITE_API_URL` — Production API domain
- [ ] `VITE_DD_*` variables (if using Datadog)
- [ ] All variables committed to SWA environment (Azure Portal)

---

## Part 6: Quick Start Commands

### Install Dependencies
```bash
npm install @azure/msal-browser @azure/msal-react jose
# or
pnpm add @azure/msal-browser @azure/msal-react jose
```

### Load Environment Variables (Vite)
```typescript
// Automatically loaded by Vite from .env
const clientId = import.meta.env.VITE_AZURE_AD_CLIENT_ID;
const tenantId = import.meta.env.VITE_AZURE_AD_TENANT_ID;
```

### Create `.env` from Template
```bash
# Copy template and fill in values
cp .env.template .env
# Edit with your values
nano .env
```

### Verify Environment Variables
```bash
# Print all VITE_* variables (for debugging)
node -e "Object.entries(import.meta.env).forEach(([k,v]) => k.startsWith('VITE_') && console.log(k, '=', v))"
```

---

## Part 7: Debugging Tips

### Enable MSAL Debug Logging

```typescript
const msalConfig = {
  // ... other config
  system: {
    loggerOptions: {
      loggerCallback: (logLevel, message, containsPii) => {
        console.log(`[MSAL] ${logLevel}: ${message}`);
      },
      piiLoggingEnabled: true, // Only in dev!
      logLevel: 3, // Verbose (0=Error, 1=Warning, 2=Info, 3=Verbose)
    },
  },
};
```

### Check Token in Browser Console

```javascript
// Get current access token
const token = localStorage.getItem("...token-key");
console.log("Token:", token);

// Decode JWT (if jwt-decode installed)
import jwtDecode from 'jwt-decode';
console.log("Claims:", jwtDecode(token));
```

### Monitor Network Requests

1. Open browser DevTools → Network tab
2. Look for requests to `login.microsoftonline.com`
3. Check `/token` requests and responses
4. Verify redirect URI in authorization request

---

