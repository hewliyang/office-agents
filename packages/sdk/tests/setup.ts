// Polyfill Uint8Array.prototype.toHex for Node.js environments.
// pdfjs-dist v5 uses this (a TC39 proposal) in its modern build,
// but it's not available in Node. Browsers that support it natively
// use the native version; this only applies to the test runner.
if (typeof Uint8Array.prototype.toHex !== "function") {
	Uint8Array.prototype.toHex = function () {
		return Array.from(this, (b) => b.toString(16).padStart(2, "0")).join("");
	};
}
