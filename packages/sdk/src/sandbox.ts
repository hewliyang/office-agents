import { ensureLockdown } from "./lockdown";

/* global Compartment */

export function sandboxedEval(
  code: string,
  globals: Record<string, unknown>,
): unknown {
  ensureLockdown();
  const compartment = new Compartment({
    globals: {
      ...globals,
      console,
      Math,
      Date,
      atob,
      btoa,
      Function: undefined,
      Reflect: undefined,
      Proxy: undefined,
      Compartment: undefined,
      harden: undefined,
      lockdown: undefined,
    },
    __options__: true,
  });
  return compartment.evaluate(`(async () => { ${code} })()`);
}
