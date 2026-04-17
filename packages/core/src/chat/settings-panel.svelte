<script lang="ts">
  import {
    API_TYPES,
    buildAuthorizationUrl,
    exchangeOAuthCode,
    generatePKCE,
    getApiKeyForProvider,
    getAuthMethodForProvider,
    getConfiguredProviders,
    HIDDEN_PROVIDERS,
    listFetchProviders,
    listImageSearchProviders,
    listSearchProviders,
    loadCustomEndpoint,
    loadOAuthCredentials,
    loadSavedConfig,
    loadWebConfig,
    OAUTH_PROVIDERS,
    removeOAuthCredentials,
    removeProviderKey,
    saveConfig,
    saveCustomEndpoint,
    saveOAuthCredentials,
    saveProviderKey,
    saveWebConfig,
    THINKING_LEVELS,
    type CustomEndpointConfig,
    type OAuthFlowState,
    type ThinkingLevel,
  } from "@office-agents/sdk";
  import {
    Check,
    ChevronDown,
    ChevronUp,
    Eye,
    EyeOff,
    ExternalLink,
    FolderUp,
    LogOut,
    Plus,
    Trash2,
  } from "lucide-svelte";
  import { getChatContext } from "./chat-runtime-context";

  const chat = getChatContext();
  const runtimeState = chat.state;
  const adapter = chat.adapter;

  let folderInputRef = $state<HTMLInputElement | null>(null);
  let fileInputRef = $state<HTMLInputElement | null>(null);
  let installing = $state(false);

  // --- Model & general settings ---
  const saved = loadSavedConfig();
  let selectedProvider = $state(saved?.provider || "");
  let selectedModel = $state(saved?.model || "");
  let useProxy = $state(saved?.useProxy !== false);
  let proxyUrl = $state(saved?.proxyUrl || "");
  let thinking = $state<ThinkingLevel>(saved?.thinking || "none");

  // --- Custom endpoint ---
  const savedCustom = loadCustomEndpoint();
  let customApiType = $state(savedCustom?.apiType || "openai-completions");
  let customBaseUrl = $state(savedCustom?.baseUrl || "");
  let customModelId = $state(savedCustom?.modelId || "");
  let customApiKey = $state(savedCustom?.apiKey || "");

  // --- Provider keys ---
  let providerKeyValues = $state<Record<string, string>>({});
  let showProviderKeys = $state<Record<string, boolean>>({});

  function loadKeyValues() {
    const keys: Record<string, string> = {};
    for (const p of chat.visibleProviders) {
      keys[p] = getApiKeyForProvider(p);
    }
    providerKeyValues = keys;
  }
  loadKeyValues();

  // --- OAuth ---
  let oauthFlows = $state<Record<string, OAuthFlowState>>({});
  let oauthCodeInputs = $state<Record<string, string>>({});

  function initOAuthFlows() {
    for (const provider of Object.keys(OAUTH_PROVIDERS)) {
      const creds = loadOAuthCredentials(provider);
      oauthFlows[provider] = creds ? { step: "connected" } : { step: "idle" };
      oauthCodeInputs[provider] = "";
    }
  }
  initOAuthFlows();

  // --- Web settings ---
  const savedWeb = loadWebConfig();
  let webSearchProvider = $state(savedWeb.searchProvider);
  let imageSearchProvider = $state(savedWeb.imageSearchProvider);
  let webFetchProvider = $state(savedWeb.fetchProvider);
  let braveApiKey = $state(savedWeb.apiKeys.brave || "");
  let serperApiKey = $state(savedWeb.apiKeys.serper || "");
  let exaApiKey = $state(savedWeb.apiKeys.exa || "");
  let browserUseApiKey = $state(savedWeb.apiKeys.browserUse || "");
  let browserbaseApiKey = $state(savedWeb.apiKeys.browserbase || "");
  let webSearchEnabled = $state(savedWeb.enabled.webSearch);
  let webFetchEnabled = $state(savedWeb.enabled.webFetch);
  let browseEnabled = $state(savedWeb.enabled.browse);
  let showAdvancedWebKeys = $state(false);

  // --- Deriveds ---
  const isCustomSelected = $derived(selectedProvider === "custom");
  const expandToolCalls = $derived(
    $runtimeState.providerConfig?.expandToolCalls ?? false,
  );
  const followMode = $derived($runtimeState.providerConfig?.followMode ?? true);
  const isConfigured = $derived($runtimeState.providerConfig !== null);

  const availableModelGroups = $derived.by(() => {
    // Trigger reactivity on providerKeyValues changes
    void providerKeyValues;
    return chat.getAvailableModels();
  });

  const hasCustomEndpoint = $derived(
    !!(customBaseUrl && customModelId && customApiKey),
  );

  const searchProviders = listSearchProviders();
  const imageSearchProviders = listImageSearchProviders();
  const fetchProviders = listFetchProviders();
  const needsBraveKey = $derived(webSearchProvider === "brave");
  const needsSerperKey = $derived(
    webSearchProvider === "serper" ||
      (adapter.hasImageSearch && imageSearchProvider === "serper"),
  );
  const needsExaKey = $derived(
    webSearchProvider === "exa" || webFetchProvider === "exa",
  );

  const oauthProviderIds = Object.keys(OAUTH_PROVIDERS);
  const apiKeyProviders = $derived(
    chat.visibleProviders.filter(
      (p: string) => !HIDDEN_PROVIDERS.has(p),
    ),
  );

  const inputStyle =
    "border-radius: var(--chat-radius); font-family: var(--chat-font-mono)";

  // --- Sync config to runtime ---
  function syncConfig() {
    let provider: string;
    let apiKey: string;
    let model: string;
    let authMethod: "apikey" | "oauth";
    let apiType: string | undefined;
    let customBaseUrlVal: string | undefined;

    if (isCustomSelected) {
      provider = "custom";
      apiKey = customApiKey;
      model = customModelId;
      authMethod = "apikey";
      apiType = customApiType;
      customBaseUrlVal = customBaseUrl;
    } else {
      provider = selectedProvider;
      model = selectedModel;
      authMethod = getAuthMethodForProvider(provider);
      apiKey = getApiKeyForProvider(provider);
      apiType = undefined;
      customBaseUrlVal = undefined;
    }

    if (!provider || !model || !apiKey) return;

    const config = {
      provider,
      apiKey,
      model,
      useProxy,
      proxyUrl,
      thinking,
      followMode,
      expandToolCalls,
      apiType: apiType || "",
      customBaseUrl: customBaseUrlVal || "",
      authMethod,
    };

    saveConfig(config);
    chat.setProviderConfig(config);
  }

  function handleModelSelect(value: string) {
    if (value === "__custom__") {
      selectedProvider = "custom";
      selectedModel = "";
      syncConfig();
      return;
    }

    const sep = value.indexOf("/");
    if (sep === -1) return;
    const provider = value.substring(0, sep);
    const modelId = value.substring(sep + 1);

    selectedProvider = provider;
    selectedModel = modelId;
    syncConfig();
  }

  function handleProviderKeyChange(provider: string, key: string) {
    providerKeyValues = { ...providerKeyValues, [provider]: key };
    saveProviderKey(provider, key);

    if (
      !selectedProvider ||
      selectedProvider === provider
    ) {
      syncConfig();
    }
  }

  function handleProviderKeyRemove(provider: string) {
    providerKeyValues = { ...providerKeyValues, [provider]: "" };
    removeProviderKey(provider);

    if (selectedProvider === provider) {
      syncConfig();
    }
  }

  function handleCustomEndpointChange() {
    saveCustomEndpoint({
      apiType: customApiType,
      baseUrl: customBaseUrl,
      modelId: customModelId,
      apiKey: customApiKey,
    });
    if (isCustomSelected) {
      syncConfig();
    }
  }

  async function startOAuthLogin(provider: string) {
    try {
      const { verifier, challenge } = await generatePKCE();
      const { url, oauthState } = buildAuthorizationUrl(
        provider,
        challenge,
        verifier,
      );
      window.open(url, "_blank");
      oauthFlows = {
        ...oauthFlows,
        [provider]: { step: "awaiting-code", verifier, oauthState },
      };
    } catch (error) {
      oauthFlows = {
        ...oauthFlows,
        [provider]: {
          step: "error",
          message:
            error instanceof Error ? error.message : "Failed to start OAuth",
        },
      };
    }
  }

  async function submitOAuthCode(provider: string) {
    const flow = oauthFlows[provider];
    if (flow?.step !== "awaiting-code" || !oauthCodeInputs[provider]?.trim())
      return;

    oauthFlows = { ...oauthFlows, [provider]: { step: "exchanging" } };

    try {
      const credentials = await exchangeOAuthCode({
        provider,
        rawInput: oauthCodeInputs[provider].trim(),
        verifier: flow.verifier,
        expectedState: flow.oauthState,
        useProxy,
        proxyUrl,
      });
      saveOAuthCredentials(provider, credentials);
      oauthFlows = { ...oauthFlows, [provider]: { step: "connected" } };
      oauthCodeInputs = { ...oauthCodeInputs, [provider]: "" };
      providerKeyValues = { ...providerKeyValues, [provider]: credentials.access };

      if (selectedProvider === provider || !selectedProvider) {
        selectedProvider = provider;
        const models = chat.getModelsForProvider(provider);
        if (models.length > 0 && !selectedModel) {
          selectedModel = models[0].id;
        }
        syncConfig();
      }
    } catch (error) {
      oauthFlows = {
        ...oauthFlows,
        [provider]: {
          step: "error",
          message:
            error instanceof Error ? error.message : "OAuth failed",
        },
      };
    }
  }

  function logoutOAuth(provider: string) {
    removeOAuthCredentials(provider);
    oauthFlows = { ...oauthFlows, [provider]: { step: "idle" } };
    providerKeyValues = { ...providerKeyValues, [provider]: "" };

    if (selectedProvider === provider) {
      const keys = providerKeyValues;
      if (!keys[provider]) {
        syncConfig();
      }
    }
  }

  function updateWebSettings(
    updates: Partial<{
      searchProvider: string;
      imageSearchProvider: string;
      fetchProvider: string;
      braveApiKey: string;
      serperApiKey: string;
      exaApiKey: string;
      browserUseApiKey: string;
      browserbaseApiKey: string;
      enabled: Partial<{
        webSearch: boolean;
        webFetch: boolean;
        browse: boolean;
      }>;
    }>,
  ) {
    webSearchProvider = updates.searchProvider ?? webSearchProvider;
    imageSearchProvider =
      updates.imageSearchProvider ?? imageSearchProvider;
    webFetchProvider = updates.fetchProvider ?? webFetchProvider;
    braveApiKey = updates.braveApiKey ?? braveApiKey;
    serperApiKey = updates.serperApiKey ?? serperApiKey;
    exaApiKey = updates.exaApiKey ?? exaApiKey;
    browserUseApiKey = updates.browserUseApiKey ?? browserUseApiKey;
    browserbaseApiKey = updates.browserbaseApiKey ?? browserbaseApiKey;

    saveWebConfig({
      searchProvider: webSearchProvider,
      imageSearchProvider,
      fetchProvider: webFetchProvider,
      apiKeys: {
        brave: braveApiKey,
        serper: serperApiKey,
        exa: exaApiKey,
        browserUse: browserUseApiKey,
        browserbase: browserbaseApiKey,
      },
      enabled: {
        webSearch: webSearchEnabled,
        webFetch: webFetchEnabled,
        browse: browseEnabled,
        ...(updates.enabled || {}),
      },
    });
  }

  async function handleFolderSelect(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    const files = target.files;
    if (!files || files.length === 0) return;

    installing = true;
    try {
      await chat.installSkill(Array.from(files));
    } finally {
      installing = false;
      if (folderInputRef) folderInputRef.value = "";
    }
  }

  async function handleFileSelect(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    const files = target.files;
    if (!files || files.length === 0) return;

    installing = true;
    try {
      await chat.installSkill(Array.from(files));
    } finally {
      installing = false;
      if (fileInputRef) fileInputRef.value = "";
    }
  }
</script>

{#snippet toggleSwitch(active: boolean, onclick: () => void, ariaLabel: string)}
  <button
    type="button"
    {onclick}
    aria-label={ariaLabel}
    class={`w-10 h-5 rounded-full transition-colors relative ${active ? "bg-(--chat-accent)" : "bg-(--chat-border)"}`}
  >
    <span
      class={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${active ? "left-5" : "left-0.5"}`}
    ></span>
  </button>
{/snippet}

{#snippet passwordField(label: string, value: string, onInput: (v: string) => void, placeholder: string, altBg?: boolean)}
  <label class="block">
    <span class="block text-xs text-(--chat-text-secondary) mb-1.5">
      {label}
    </span>
    <input
      type="password"
      {value}
      oninput={(e) => onInput((e.currentTarget as HTMLInputElement).value)}
      {placeholder}
      class={`w-full text-(--chat-text-primary) text-sm px-3 py-2 border border-(--chat-border) placeholder:text-(--chat-text-muted) focus:outline-none focus:border-(--chat-border-active) ${altBg ? "bg-(--chat-bg)" : "bg-(--chat-input-bg)"}`}
      style={inputStyle}
    />
  </label>
{/snippet}

<div class="flex-1 overflow-y-auto p-4 space-y-6" style="font-family: var(--chat-font-mono)">

  <!-- ═══ MODEL SELECTION ═══ -->
  <div>
    <div class="text-[10px] uppercase tracking-widest text-(--chat-text-muted) mb-4">
      model
    </div>

    <div class="space-y-4">
      <label class="block">
        <select
          value={isCustomSelected ? "__custom__" : `${selectedProvider}/${selectedModel}`}
          onchange={(event) =>
            handleModelSelect((event.currentTarget as HTMLSelectElement).value)}
          class="w-full bg-(--chat-input-bg) text-(--chat-text-primary) text-sm px-3 py-2 border border-(--chat-border) focus:outline-none focus:border-(--chat-border-active)"
          style={inputStyle}
        >
          {#if availableModelGroups.length === 0 && !hasCustomEndpoint}
            <option value="" disabled selected>Add API keys below to see models…</option>
          {/if}
          {#each availableModelGroups as group (group.provider)}
            <optgroup label={group.provider}>
              {#each group.models as m (m.id)}
                <option value={`${group.provider}/${m.id}`}>{m.name}</option>
              {/each}
            </optgroup>
          {/each}
          {#if hasCustomEndpoint}
            <optgroup label="Custom Endpoint">
              <option value="__custom__">{customModelId}</option>
            </optgroup>
          {/if}
        </select>
      </label>

      {#if isConfigured}
        <div class="flex items-center gap-2 text-xs">
          <Check size={12} class="text-(--chat-success)" />
          <span class="text-(--chat-text-secondary)">
            Using
            {#if $runtimeState.providerConfig?.provider === "custom"}
              custom ({$runtimeState.providerConfig?.apiType})
            {:else}
              {$runtimeState.providerConfig?.provider}
            {/if}
            {$runtimeState.providerConfig?.authMethod === "oauth" ? " via OAuth" : ""}
            — {$runtimeState.providerConfig?.model}
          </span>
        </div>
      {:else}
        <p class="text-[10px] text-(--chat-text-muted)">
          Configure at least one provider below to get started.
        </p>
      {/if}
    </div>
  </div>

  <!-- ═══ THINKING LEVEL ═══ -->
  <div class="border-t border-(--chat-border) pt-4">
    <span class="block text-xs text-(--chat-text-secondary) mb-1.5">
      Thinking Level
    </span>
    <div class="flex gap-1">
      {#each THINKING_LEVELS as level (level.value)}
        <button
          type="button"
          onclick={() => { thinking = level.value; syncConfig(); }}
          class={`flex-1 py-1.5 text-xs border transition-colors ${thinking === level.value ? "bg-(--chat-accent) border-(--chat-accent) text-white" : "bg-(--chat-input-bg) border-(--chat-border) text-(--chat-text-secondary) hover:border-(--chat-border-active)"}`}
          style="border-radius: var(--chat-radius)"
        >
          {level.label}
        </button>
      {/each}
    </div>
    <p class="text-[10px] text-(--chat-text-muted) mt-1">
      Extended thinking for supported models
    </p>
  </div>

  <!-- ═══ API KEYS & LOGIN ═══ -->
  <div class="border-t border-(--chat-border) pt-4">
    <details class="group">
      <summary class="flex items-center gap-1.5 cursor-pointer select-none mb-3">
        <ChevronDown size={12} class="text-(--chat-text-muted) group-open:hidden" />
        <ChevronUp size={12} class="text-(--chat-text-muted) hidden group-open:inline" />
        <span class="text-[10px] uppercase tracking-widest text-(--chat-text-muted)">
          api keys & login
        </span>
        {#if getConfiguredProviders().length > 0}
          <span class="text-[10px] text-(--chat-text-muted)">
            ({getConfiguredProviders().length} configured)
          </span>
        {/if}
      </summary>

      <div class="space-y-4">
        <!-- OAuth Logins -->
        <div>
          <p class="text-[10px] text-(--chat-text-muted) mb-2">
            Log in with your existing subscription, or enter API keys below.
          </p>
          <div class="space-y-2">
            {#each oauthProviderIds as provider (provider)}
              {@const flow = oauthFlows[provider] || { step: "idle" }}
              {@const providerLabel = OAUTH_PROVIDERS[provider]?.label ?? provider}
              <div
                class="px-3 py-2.5 bg-(--chat-input-bg) border border-(--chat-border)"
                style="border-radius: var(--chat-radius)"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-xs text-(--chat-text-primary)">
                      {provider}
                    </div>
                    <div class="text-[10px] text-(--chat-text-muted) mt-0.5">
                      {providerLabel}
                    </div>
                  </div>
                  {#if flow.step === "connected"}
                    <div class="flex items-center gap-2">
                      <Check size={10} class="text-(--chat-success)" />
                      <button
                        type="button"
                        onclick={() => logoutOAuth(provider)}
                        class="flex items-center gap-1 text-[10px] text-(--chat-text-muted) hover:text-(--chat-error) transition-colors"
                      >
                        <LogOut size={10} />
                        Logout
                      </button>
                    </div>
                  {:else if flow.step === "exchanging"}
                    <span class="text-[10px] text-(--chat-text-muted)">Exchanging…</span>
                  {:else}
                    <button
                      type="button"
                      onclick={() => startOAuthLogin(provider)}
                      class="flex items-center gap-1 px-2.5 py-1 text-[10px] bg-(--chat-bg) border border-(--chat-border) text-(--chat-text-secondary) hover:border-(--chat-accent) hover:text-(--chat-accent) transition-colors"
                      style="border-radius: var(--chat-radius)"
                    >
                      <ExternalLink size={10} />
                      Login
                    </button>
                  {/if}
                </div>

                {#if flow.step === "awaiting-code"}
                  <div class="mt-2 space-y-1.5">
                    <p class="text-[10px] text-(--chat-text-muted)">
                      {provider === "openai-codex"
                        ? "Paste the full redirect URL:"
                        : "Paste the code from the redirect page:"}
                    </p>
                    <div class="flex gap-1">
                      <input
                        type="text"
                        value={oauthCodeInputs[provider] || ""}
                        oninput={(e) => { oauthCodeInputs = { ...oauthCodeInputs, [provider]: (e.currentTarget as HTMLInputElement).value }; }}
                        placeholder={provider === "openai-codex" ? "Paste redirect URL" : "Paste code#state"}
                        class="flex-1 bg-(--chat-bg) text-(--chat-text-primary) text-sm px-3 py-1.5 border border-(--chat-border) placeholder:text-(--chat-text-muted) focus:outline-none focus:border-(--chat-border-active)"
                        style={inputStyle}
                        onkeydown={(event) => event.key === "Enter" && submitOAuthCode(provider)}
                      />
                      <button
                        type="button"
                        onclick={() => submitOAuthCode(provider)}
                        disabled={!oauthCodeInputs[provider]?.trim()}
                        class="px-2.5 py-1.5 text-xs bg-(--chat-accent) text-white border border-(--chat-accent) hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        style="border-radius: var(--chat-radius)"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                {/if}

                {#if flow.step === "error"}
                  <div class="mt-2 space-y-1">
                    <div class="text-[10px] text-(--chat-error)">{flow.message}</div>
                    <button
                      type="button"
                      onclick={() => { oauthFlows = { ...oauthFlows, [provider]: { step: "idle" } }; }}
                      class="text-[10px] text-(--chat-text-muted) hover:text-(--chat-text-secondary)"
                    >
                      Try again
                    </button>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>

        <!-- API Keys -->
        <div class="space-y-2">
          <div class="text-[10px] text-(--chat-text-muted)">
            API Keys
          </div>
          {#each apiKeyProviders as provider (provider)}
            {@const hasKey = !!(providerKeyValues[provider])}
            {@const isShown = showProviderKeys[provider]}
            <div class="flex items-center gap-2">
              <span class="text-xs text-(--chat-text-secondary) w-24 shrink-0 truncate" title={provider}>
                {provider}
              </span>
              <div class="relative flex-1">
                <input
                  type={isShown ? "text" : "password"}
                  value={providerKeyValues[provider] || ""}
                  oninput={(e) => handleProviderKeyChange(provider, (e.currentTarget as HTMLInputElement).value)}
                  placeholder="API key"
                  class="w-full bg-(--chat-input-bg) text-(--chat-text-primary) text-sm px-3 py-1.5 pr-8 border border-(--chat-border) placeholder:text-(--chat-text-muted) focus:outline-none focus:border-(--chat-border-active)"
                  style={inputStyle}
                />
                {#if hasKey}
                  <button
                    type="button"
                    onclick={() => { showProviderKeys = { ...showProviderKeys, [provider]: !isShown }; }}
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-(--chat-text-muted) hover:text-(--chat-text-secondary)"
                  >
                    {#if isShown}
                      <EyeOff size={12} />
                    {:else}
                      <Eye size={12} />
                    {/if}
                  </button>
                {/if}
              </div>
              {#if hasKey}
                <Check size={12} class="text-(--chat-success) shrink-0" />
              {/if}
            </div>
          {/each}
        </div>

        <p class="text-[10px] text-(--chat-text-muted)">
          Keys are stored locally in your browser. Add keys for any provider to see its models above.
        </p>
      </div>
    </details>
  </div>

  <!-- ═══ CORS PROXY ═══ -->
  <div class="border-t border-(--chat-border) pt-4 space-y-3">
    <div class="flex items-center justify-between">
      <div>
        <span class="text-xs text-(--chat-text-secondary)">
          CORS Proxy
        </span>
        <p class="text-[10px] text-(--chat-text-muted) mt-0.5">
          Required for Anthropic and some providers
        </p>
      </div>
      {@render toggleSwitch(
        useProxy,
        () => { useProxy = !useProxy; syncConfig(); },
        useProxy ? "Disable CORS proxy" : "Enable CORS proxy",
      )}
    </div>

    {#if useProxy}
      <label class="block">
        <span class="block text-xs text-(--chat-text-secondary) mb-1.5">
          Proxy URL
        </span>
        <input
          type="text"
          bind:value={proxyUrl}
          oninput={() => syncConfig()}
          placeholder="https://your-proxy.com/proxy"
          class="w-full bg-(--chat-input-bg) text-(--chat-text-primary) text-sm px-3 py-2 border border-(--chat-border) placeholder:text-(--chat-text-muted) focus:outline-none focus:border-(--chat-border-active)"
          style={inputStyle}
        />
        <p class="text-[10px] text-(--chat-text-muted) mt-1">
          Your proxy should accept ?url=encoded_url format
        </p>
      </label>
    {/if}
  </div>

  <!-- ═══ CUSTOM ENDPOINT ═══ -->
  <div class="border-t border-(--chat-border) pt-4">
    <details class="group">
      <summary class="flex items-center gap-1.5 cursor-pointer select-none mb-3">
        <ChevronDown size={12} class="text-(--chat-text-muted) group-open:hidden" />
        <ChevronUp size={12} class="text-(--chat-text-muted) hidden group-open:inline" />
        <span class="text-[10px] uppercase tracking-widest text-(--chat-text-muted)">
          custom endpoint
        </span>
        {#if hasCustomEndpoint}
          <Check size={10} class="text-(--chat-success)" />
        {/if}
      </summary>

      <div class="space-y-3">
        <p class="text-[10px] text-(--chat-text-muted)">
          Connect to any compatible API (Ollama, vLLM, LMStudio, etc.)
        </p>

        <label class="block">
          <span class="block text-xs text-(--chat-text-secondary) mb-1.5">
            API Type
          </span>
          <select
            value={customApiType}
            onchange={(event) => {
              customApiType = (event.currentTarget as HTMLSelectElement).value;
              handleCustomEndpointChange();
            }}
            class="w-full bg-(--chat-input-bg) text-(--chat-text-primary) text-sm px-3 py-2 border border-(--chat-border) focus:outline-none focus:border-(--chat-border-active)"
            style={inputStyle}
          >
            {#each API_TYPES as type (type.id)}
              <option value={type.id}>{type.name}</option>
            {/each}
          </select>
          <p class="text-[10px] text-(--chat-text-muted) mt-1">
            {API_TYPES.find((type) => type.id === customApiType)?.hint}
          </p>
        </label>

        <label class="block">
          <span class="block text-xs text-(--chat-text-secondary) mb-1.5">
            Base URL
          </span>
          <input
            type="text"
            bind:value={customBaseUrl}
            oninput={() => handleCustomEndpointChange()}
            placeholder="https://api.openai.com/v1"
            class="w-full bg-(--chat-input-bg) text-(--chat-text-primary) text-sm px-3 py-2 border border-(--chat-border) placeholder:text-(--chat-text-muted) focus:outline-none focus:border-(--chat-border-active)"
            style={inputStyle}
          />
        </label>

        <label class="block">
          <span class="block text-xs text-(--chat-text-secondary) mb-1.5">
            Model ID
          </span>
          <input
            type="text"
            bind:value={customModelId}
            oninput={() => handleCustomEndpointChange()}
            placeholder="gpt-4o"
            class="w-full bg-(--chat-input-bg) text-(--chat-text-primary) text-sm px-3 py-2 border border-(--chat-border) placeholder:text-(--chat-text-muted) focus:outline-none focus:border-(--chat-border-active)"
            style={inputStyle}
          />
        </label>

        <label class="block">
          <span class="block text-xs text-(--chat-text-secondary) mb-1.5">
            API Key
          </span>
          <input
            type="password"
            bind:value={customApiKey}
            oninput={() => handleCustomEndpointChange()}
            placeholder="Enter API key"
            class="w-full bg-(--chat-input-bg) text-(--chat-text-primary) text-sm px-3 py-2 border border-(--chat-border) placeholder:text-(--chat-text-muted) focus:outline-none focus:border-(--chat-border-active)"
            style={inputStyle}
          />
        </label>
      </div>
    </details>
  </div>

  <!-- ═══ EXPAND TOOL CALLS ═══ -->
  <div class="border-t border-(--chat-border) pt-4">
    <div class="flex items-center justify-between">
      <div>
        <span class="text-xs text-(--chat-text-secondary)">
          Expand Tool Calls
        </span>
        <p class="text-[10px] text-(--chat-text-muted) mt-0.5">
          Show tool call details expanded by default
        </p>
      </div>
      {@render toggleSwitch(
        expandToolCalls,
        () => chat.toggleExpandToolCalls(),
        expandToolCalls ? "Collapse tool calls by default" : "Expand tool calls by default",
      )}
    </div>
  </div>

  <!-- ═══ WEB TOOLS ═══ -->
  <div class="border-t border-(--chat-border) pt-4 space-y-3">
    <div class="text-[10px] uppercase tracking-widest text-(--chat-text-muted)">
      web tools
    </div>

    <div class="flex items-center justify-between">
      <div>
        <span class="text-xs text-(--chat-text-secondary)">
          Web Search
        </span>
        <p class="text-[10px] text-(--chat-text-muted) mt-0.5">
          Enable the <code class="text-(--chat-text-secondary)">web-search</code> command
        </p>
      </div>
      {@render toggleSwitch(
        webSearchEnabled,
        () => { webSearchEnabled = !webSearchEnabled; updateWebSettings({ enabled: { webSearch: webSearchEnabled } }); },
        webSearchEnabled ? "Disable web search" : "Enable web search",
      )}
    </div>

    <div class="flex items-center justify-between">
      <div>
        <span class="text-xs text-(--chat-text-secondary)">
          Web Fetch
        </span>
        <p class="text-[10px] text-(--chat-text-muted) mt-0.5">
          Enable the <code class="text-(--chat-text-secondary)">web-fetch</code> command
        </p>
      </div>
      {@render toggleSwitch(
        webFetchEnabled,
        () => { webFetchEnabled = !webFetchEnabled; updateWebSettings({ enabled: { webFetch: webFetchEnabled } }); },
        webFetchEnabled ? "Disable web fetch" : "Enable web fetch",
      )}
    </div>

    {#if webSearchEnabled}
      <label class="block">
        <span class="block text-xs text-(--chat-text-secondary) mb-1.5">
          Default Search Provider
        </span>
        <select
          value={webSearchProvider}
          onchange={(event) =>
            updateWebSettings({
              searchProvider: (event.currentTarget as HTMLSelectElement).value,
            })}
          class="w-full bg-(--chat-input-bg) text-(--chat-text-primary) text-sm px-3 py-2 border border-(--chat-border) focus:outline-none focus:border-(--chat-border-active)"
          style={inputStyle}
        >
          {#each searchProviders as sp (sp.id)}
            <option value={sp.id}>{sp.label}</option>
          {/each}
        </select>
      </label>

      {#if adapter.hasImageSearch}
        <label class="block">
          <span class="block text-xs text-(--chat-text-secondary) mb-1.5">
            Default Image Search Provider
          </span>
          <select
            value={imageSearchProvider}
            onchange={(event) =>
              updateWebSettings({
                imageSearchProvider:
                  (event.currentTarget as HTMLSelectElement).value,
              })}
            class="w-full bg-(--chat-input-bg) text-(--chat-text-primary) text-sm px-3 py-2 border border-(--chat-border) focus:outline-none focus:border-(--chat-border-active)"
            style={inputStyle}
          >
            {#each imageSearchProviders as ip (ip.id)}
              <option value={ip.id}>{ip.label}</option>
            {/each}
          </select>
        </label>
      {/if}
    {/if}

    {#if webFetchEnabled}
      <label class="block">
        <span class="block text-xs text-(--chat-text-secondary) mb-1.5">
          Default Fetch Provider
        </span>
        <select
          value={webFetchProvider}
          onchange={(event) =>
            updateWebSettings({
              fetchProvider: (event.currentTarget as HTMLSelectElement).value,
            })}
          class="w-full bg-(--chat-input-bg) text-(--chat-text-primary) text-sm px-3 py-2 border border-(--chat-border) focus:outline-none focus:border-(--chat-border-active)"
          style={inputStyle}
        >
          {#each fetchProviders as fp (fp)}
            <option value={fp}>{fp}</option>
          {/each}
        </select>
      </label>
    {/if}

    {#if webSearchEnabled || webFetchEnabled}
      {#if needsBraveKey}
        {@render passwordField("Brave API Key", braveApiKey, (v) => { braveApiKey = v; updateWebSettings({ braveApiKey }); }, "Required for Brave search")}
      {/if}

      {#if needsSerperKey}
        {@render passwordField("Serper API Key", serperApiKey, (v) => { serperApiKey = v; updateWebSettings({ serperApiKey }); }, "Required for Serper search")}
      {/if}

      {#if needsExaKey}
        {@render passwordField("Exa API Key", exaApiKey, (v) => { exaApiKey = v; updateWebSettings({ exaApiKey }); }, "Required for Exa search/fetch")}
      {/if}

      <div class="pt-1">
        <button
          type="button"
          onclick={() => (showAdvancedWebKeys = !showAdvancedWebKeys)}
          class="inline-flex items-center gap-1.5 text-xs text-(--chat-text-secondary) hover:text-(--chat-text-primary)"
        >
          {#if showAdvancedWebKeys}
            <ChevronUp size={12} />
          {:else}
            <ChevronDown size={12} />
          {/if}
          <span>
            {showAdvancedWebKeys ? "Hide" : "Show"} advanced saved API keys
          </span>
        </button>
      </div>

      {#if showAdvancedWebKeys}
        <div class="space-y-3 border border-(--chat-border) p-3 bg-(--chat-input-bg)">
          {#if !needsBraveKey}
            {@render passwordField("Brave API Key", braveApiKey, (v) => { braveApiKey = v; updateWebSettings({ braveApiKey }); }, "Optional", true)}
          {/if}

          {#if !needsSerperKey}
            {@render passwordField("Serper API Key", serperApiKey, (v) => { serperApiKey = v; updateWebSettings({ serperApiKey }); }, "Optional", true)}
          {/if}

          {#if !needsExaKey}
            {@render passwordField("Exa API Key", exaApiKey, (v) => { exaApiKey = v; updateWebSettings({ exaApiKey }); }, "Optional", true)}
          {/if}
        </div>
      {/if}
    {/if}
  </div>

  <!-- ═══ CLOUD BROWSER ═══ -->
  <div class="border-t border-(--chat-border) pt-4 space-y-3">
    <div class="text-[10px] uppercase tracking-widest text-(--chat-text-muted)">
      cloud browser
    </div>

    <div class="flex items-center justify-between">
      <div>
        <span class="text-xs text-(--chat-text-secondary)">
          Browse
        </span>
        <p class="text-[10px] text-(--chat-text-muted) mt-0.5">
          Enable the <code class="text-(--chat-text-secondary)">browse</code> command
        </p>
      </div>
      {@render toggleSwitch(
        browseEnabled,
        () => { browseEnabled = !browseEnabled; updateWebSettings({ enabled: { browse: browseEnabled } }); },
        browseEnabled ? "Disable cloud browser" : "Enable cloud browser",
      )}
    </div>

    {#if browseEnabled}
      <p class="text-[10px] text-(--chat-text-muted)">
        Configure a cloud browser provider.
        The agent can navigate pages, click elements, take screenshots, and extract data.
      </p>

      <details class="group">
        <summary class="flex items-center gap-1.5 text-xs text-(--chat-text-secondary) hover:text-(--chat-text-primary) cursor-pointer select-none">
          <ChevronDown size={12} class="group-open:hidden" />
          <ChevronUp size={12} class="hidden group-open:inline" />
          Browser Use
          {#if browserUseApiKey}
            <Check size={10} class="text-(--chat-success)" />
          {/if}
        </summary>
        <div class="mt-2 space-y-2 pl-0.5">
          {@render passwordField("API Key", browserUseApiKey, (v) => { browserUseApiKey = v; updateWebSettings({ browserUseApiKey }); }, "bu-api-...")}
          <p class="text-[10px] text-(--chat-text-muted)">
            Get an API key at <a href="https://cloud.browser-use.com/new-api-key" target="_blank" class="underline hover:text-(--chat-text-secondary)">cloud.browser-use.com</a>
          </p>
        </div>
      </details>

      <details class="group">
        <summary class="flex items-center gap-1.5 text-xs text-(--chat-text-secondary) hover:text-(--chat-text-primary) cursor-pointer select-none">
          <ChevronDown size={12} class="group-open:hidden" />
          <ChevronUp size={12} class="hidden group-open:inline" />
          Browserbase
          {#if browserbaseApiKey}
            <Check size={10} class="text-(--chat-success)" />
          {/if}
        </summary>
        <div class="mt-2 space-y-2 pl-0.5">
          {@render passwordField("API Key", browserbaseApiKey, (v) => { browserbaseApiKey = v; updateWebSettings({ browserbaseApiKey }); }, "bb_live_...")}
          <p class="text-[10px] text-(--chat-text-muted)">
            Get an API key at <a href="https://www.browserbase.com/settings" target="_blank" class="underline hover:text-(--chat-text-secondary)">browserbase.com/settings</a>
          </p>
          {#if browserbaseApiKey && browserUseApiKey}
            <p class="text-[10px] text-(--chat-text-muted) italic">
              Both providers configured — Browserbase will be used.
            </p>
          {/if}
        </div>
      </details>
    {/if}
  </div>

  <!-- ═══ AGENT SKILLS ═══ -->
  <div class="border-t border-(--chat-border) pt-4">
    <div class="text-[10px] uppercase tracking-widest text-(--chat-text-muted) mb-4">
      agent skills
    </div>

    <div class="space-y-3">
      {#if $runtimeState.skills.length > 0}
        <div class="space-y-1">
          {#each $runtimeState.skills as skill (skill.name)}
            <div
              class="flex items-start justify-between gap-2 px-3 py-2 bg-(--chat-input-bg) border border-(--chat-border)"
              style="border-radius: var(--chat-radius)"
            >
              <div class="min-w-0 flex-1">
                <div class="text-xs text-(--chat-text-primary) font-medium truncate">
                  {skill.name}
                </div>
                <div class="text-[10px] text-(--chat-text-muted) mt-0.5 line-clamp-2">
                  {skill.description}
                </div>
              </div>
              <button
                type="button"
                onclick={() => chat.uninstallSkill(skill.name)}
                class="shrink-0 p-1 text-(--chat-text-muted) hover:text-(--chat-error) transition-colors"
                title="Remove skill"
              >
                <Trash2 size={12} />
              </button>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-xs text-(--chat-text-muted)">No skills installed</p>
      {/if}

      <div class="flex gap-2">
        <button
          type="button"
          onclick={() => folderInputRef?.click()}
          disabled={installing}
          class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs bg-(--chat-input-bg) border border-(--chat-border) text-(--chat-text-secondary) hover:border-(--chat-border-active) hover:text-(--chat-text-primary) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style="border-radius: var(--chat-radius)"
        >
          <FolderUp size={12} />
          {installing ? "Installing…" : "Add Folder"}
        </button>
        <button
          type="button"
          onclick={() => fileInputRef?.click()}
          disabled={installing}
          class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs bg-(--chat-input-bg) border border-(--chat-border) text-(--chat-text-secondary) hover:border-(--chat-border-active) hover:text-(--chat-text-primary) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style="border-radius: var(--chat-radius)"
        >
          <Plus size={12} />
          {installing ? "Installing…" : "Add File"}
        </button>
      </div>

      <p class="text-[10px] text-(--chat-text-muted)">
        Add a skill folder or a single SKILL.md file. Skills must have valid
        frontmatter with name and description.
      </p>
    </div>

    <input
      bind:this={folderInputRef}
      type="file"
      class="hidden"
      webkitdirectory={true}
      multiple
      onchange={handleFolderSelect}
    />
    <input
      bind:this={fileInputRef}
      type="file"
      accept=".md"
      class="hidden"
      onchange={handleFileSelect}
    />
  </div>

  <!-- ═══ ABOUT ═══ -->
  <div class="border-t border-(--chat-border) pt-4">
    <div class="text-[10px] uppercase tracking-widest text-(--chat-text-muted) mb-2">
      about
    </div>
    <p class="text-xs text-(--chat-text-secondary) leading-relaxed">
      {adapter.appName || "This app"} uses your own API key to connect to LLM
      providers. Your key is stored locally in the browser.
    </p>
    {#if useProxy}
      <p class="text-xs text-(--chat-text-muted) leading-relaxed mt-2">
        CORS Proxy: Requests route through your proxy to bypass browser CORS
        restrictions.
      </p>
    {/if}
    <p class="text-[10px] text-(--chat-text-muted) mt-3">
      {adapter.appVersion ? `v${adapter.appVersion}` : ""}
    </p>
  </div>
</div>


