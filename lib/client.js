window.__ModuleLoader__.load({
	id: "dsh-client-ui-read-aloud",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

		//#region styles
		const css = ".dshReadAloud_action{width:calc(28px + var(--dsh-content-font-delta,0px));height:calc(28px + var(--dsh-content-font-delta,0px));border-radius:var(--dsw-radius-sm);color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;justify-content:center;align-items:center;padding:3px;display:inline-flex}.dshReadAloud_action svg{width:calc(20px + var(--dsh-content-font-delta,0px));height:calc(20px + var(--dsh-content-font-delta,0px))}.dshReadAloud_actions[data-clock=end] .dshReadAloud_action svg{width:calc(22px + var(--dsh-content-font-delta,0px));height:calc(22px + var(--dsh-content-font-delta,0px))}.dshReadAloud_action:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}.dshReadAloud_action:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}.dshReadAloud_action[data-speaking]{color:var(--dsw-alias-state-business-primary)}.dshReadAloud_action[data-auto=on]{color:var(--dsw-alias-label-secondary)}.dshReadAloud_action[data-speaking] .dshReadAloud_wave{animation:dshReadAloud_pulse 1.15s ease-in-out infinite}.dshReadAloud_action[data-speaking] .dshReadAloud_wave2{animation-delay:.22s}.dshReadAloud_hint{color:var(--dsw-alias-label-tertiary);padding-left:4px;font-size:13px;line-height:20px}.dshReadAloud_voice{height:calc(28px + var(--dsh-content-font-delta,0px));max-width:11em;border-radius:var(--dsw-radius-sm);color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:1px solid transparent;padding:0 4px;font-size:13px;font-family:inherit;appearance:none}.dshReadAloud_voice:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}.dshReadAloud_voice:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}.dshReadAloud_rate{height:calc(28px + var(--dsh-content-font-delta,0px));max-width:5em;border-radius:var(--dsw-radius-sm);color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:1px solid transparent;padding:0 4px;font-size:13px;font-family:inherit;appearance:none}.dshReadAloud_rate:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}.dshReadAloud_rate:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}@keyframes dshReadAloud_pulse{0%,100%{opacity:.3}50%{opacity:1}}@media (prefers-reduced-motion:reduce){.dshReadAloud_action[data-speaking] .dshReadAloud_wave{animation:none}}";
		const tagId = "dsh-client-ui-read-aloud/ReadAloudAction.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-client-ui-read-aloud";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		const cls = {
			action: "dshReadAloud_action",
			actions: "dshReadAloud_actions",
			hint: "dshReadAloud_hint",
			wave: "dshReadAloud_wave",
			wave2: "dshReadAloud_wave2",
			voice: "dshReadAloud_voice",
			rate: "dshReadAloud_rate"
		};
		//#endregion

		//#region markdown -> speech text
		/**
		* Reduce one markdown reply to the prose a reader should hear: code blocks
		* are dropped, links and images keep their text, and structural markers
		* (headings, quotes, list bullets, table pipes, emphasis) disappear.
		* @param markdown - the assistant message text.
		* @returns speakable plain text.
		*/
		function toSpeechText(markdown) {
			let s = String(markdown === undefined || markdown === null ? "" : markdown);
			s = s.replace(/```[\s\S]*?```/g, " ");
			s = s.replace(/~~~[\s\S]*?~~~/g, " ");
			s = s.replace(/`([^`]*)`/g, "$1");
			s = s.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1");
			s = s.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
			s = s.replace(/^\s{0,3}#{1,6}\s*/gm, "");
			s = s.replace(/^\s{0,3}>\s?/gm, "");
			s = s.replace(/^\s{0,3}(?:[-*+]|\d+[.)])\s+/gm, "");
			s = s.replace(/^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/gm, " ");
			s = s.replace(/^\s*\|.*\|\s*$/gm, (line) => line.replace(/\|/g, " "));
			s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
			s = s.replace(/__([^_]+)__/g, "$1");
			s = s.replace(/~~([^~]+)~~/g, "$1");
			s = s.replace(/(^|[^*\w])\*([^*\n]+)\*/g, "$1$2");
			s = s.replace(/(^|[^_\w])_([^_\n]+)_/g, "$1$2");
			s = s.replace(/<[^>]+>/g, " ");
			s = s.replace(/\s+/g, " ");
			return s.trim();
		}
		/** Fraction of CJK characters above which the reply is read as Chinese. */
		function detectLang(text) {
			const cjk = (text.match(/[\u3400-\u9fff\uf900-\ufaff]/g) || []).length;
			const letters = (text.match(/[A-Za-z\u3400-\u9fff\uf900-\ufaff]/g) || []).length;
			return letters > 0 && cjk / letters > 0.2 ? "zh-CN" : "en-US";
		}
		/**
		* Split prose into utterances the engine finishes reliably: cut after
		* sentence punctuation, and fall back to a comma or space near the limit.
		* @param text - speakable plain text.
		* @returns non-empty utterance texts in reading order.
		*/
		function chunkText(text) {
			const s = String(text === undefined || text === null ? "" : text).replace(/\s+/g, " ").trim();
			if (s === "") return [];
			const SENTENCE = /[。！？；!?;\n]/;
			const LIMIT = 170;
			const out = [];
			let buf = "";
			for (const ch of s) {
				buf += ch;
				if (SENTENCE.test(ch)) {
					if (buf.trim() !== "") out.push(buf.trim());
					buf = "";
					continue;
				}
				if (buf.length >= LIMIT) {
					const cut = Math.max(buf.lastIndexOf(", "), buf.lastIndexOf("，"), buf.lastIndexOf(" "));
					if (cut > LIMIT * 0.55) {
						out.push(buf.slice(0, cut + 1).trim());
						buf = buf.slice(cut + 1);
					} else {
						out.push(buf.trim());
						buf = "";
					}
				}
			}
			if (buf.trim() !== "") out.push(buf.trim());
			return out.filter((chunk) => chunk !== "");
		}
		//#endregion

		//#region speech engine
		const synth = typeof window !== "undefined" && window.speechSynthesis ? window.speechSynthesis : void 0;
		/**
		* Host neural TTS endpoint. The page probes it once on first use instead of
		* relying on injected boot state, so a host-side problem can never break the
		* served index.
		*/
		const HOST_BASE = "/dsh-read-aloud";
		/** The page's fetch, resolved lazily so a host can install it after load. */
		const request = (url, options) => {
			const fn = typeof window !== "undefined" && typeof window.fetch === "function" ? window.fetch : typeof fetch === "function" ? fetch : void 0;
			if (fn === void 0) return Promise.reject(new Error("no fetch"));
			return fn.call(typeof window !== "undefined" ? window : void 0, url, options);
		};
		let hostReady = null;
		/** Resolve whether the host renderer answers, caching the answer. */
		const probeHost = () => {
			if (hostReady !== null) return hostReady;
			hostReady = request(`${HOST_BASE}/voices`, { method: "GET" }).then((response) => response.ok ? response.json() : null).then((body) => body !== null && body !== undefined && Array.isArray(body.voices) ? { base: HOST_BASE, voices: body.voices } : null).catch(() => null);
			return hostReady;
		};
		/** One shared audio element for host-rendered speech. */
		let audio = null;
		/** Stop host playback and drop its listeners. */
		const stopAudio = () => {
			if (audio === null) return;
			try {
				audio.pause();
				audio.src = "";
			} catch (error) {
				console.warn("[ui-read-aloud] audio stop failed:", error);
			}
			audio = null;
		};
		/** Cached engine voices; the list arrives asynchronously on first use. */
		let voices = [];
		const refreshVoices = () => {
			if (synth === void 0) return;
			try {
				const next = synth.getVoices();
				if (next && next.length > 0) voices = next;
			} catch (error) {
				console.warn("[ui-read-aloud] voice enumeration failed:", error);
			}
		};
		if (synth !== void 0) {
			refreshVoices();
			if (typeof synth.addEventListener === "function") synth.addEventListener("voiceschanged", refreshVoices);
			else synth.onvoiceschanged = refreshVoices;
		}
		/**
		* Choose the engine voice for one language, preferring an exact tag and
		* falling back to the same primary subtag.
		* @param lang - the utterance language tag.
		* @returns the voice, or undefined to let the engine decide.
		*/
		function pickVoice(lang) {
			if (voices.length === 0) refreshVoices();
			if (voices.length === 0) return void 0;
			const wanted = lang.toLowerCase();
			const prefix = wanted.slice(0, 2);
			const normalize = (tag) => String(tag || "").toLowerCase().replace(/_/g, "-");
			const exact = voices.find((voice) => normalize(voice.lang) === wanted);
			if (exact !== void 0) return exact;
			const sameFamily = voices.find((voice) => normalize(voice.lang).startsWith(prefix));
			return sameFamily;
		}
		const IDLE = Object.freeze({ messageId: null, error: null });
		/**
		* Translate a prosody percentage such as `+18%` into the multiplier the
		* browser engine expects, so both engines speak at the same speed.
		* @param rate - the stored percentage.
		* @returns the clamped multiplier.
		*/
		function browserRate(rate) {
			const match = /^([+-]?)(\d{1,3})%$/.exec(String(rate));
			if (match === null) return 1.18;
			const value = 1 + (match[1] === "-" ? -1 : 1) * Number(match[2]) / 100;
			return Math.min(3, Math.max(0.5, value));
		}
		/**
		* One page-wide reader: only one reply speaks at a time, a second request
		* replaces the first, and the queue advances one utterance per `onend` so
		* the engine never receives a batch it may truncate.
		*/
		const speaker = {
			snapshot: IDLE,
			listeners: /* @__PURE__ */ new Set(),
			token: 0,
			pendingStarts: 0,
			chunks: [],
			lang: "zh-CN",
			errorTimer: null,
			getSnapshot() {
				return this.snapshot;
			},
			subscribe(listener) {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			},
			publish(next) {
				this.snapshot = Object.freeze(next);
				for (const listener of this.listeners) try {
					listener();
				} catch (error) {
					console.error("[ui-read-aloud] subscriber threw:", error);
				}
			},
			/** Raise one transient hint, replacing any shown before it. */
			fail(kind) {
				if (this.errorTimer !== null) clearTimeout(this.errorTimer);
				this.publish({ messageId: null, error: kind });
				this.errorTimer = setTimeout(() => {
					this.errorTimer = null;
					if (this.snapshot.error === kind) this.publish(IDLE);
				}, 3500);
			},
			/** Cancel whatever is speaking and clear the busy state. */
			stop() {
				this.token += 1;
				this.pendingStarts += 1;
				stopAudio();
				if (synth !== void 0) {
					try {
						synth.cancel();
					} catch (error) {
						console.warn("[ui-read-aloud] cancel failed:", error);
					}
				}
				if (this.snapshot.messageId !== null) this.publish({ messageId: null, error: this.snapshot.error });
			},
			/**
			* Read one reply aloud. Host-rendered neural audio is preferred; the
			* browser engine is the fallback when no host endpoint is present.
			* @param messageId - the reply whose button was pressed.
			* @param text - speakable plain text.
			* @returns whether the engine accepted the request.
			*/
			speak(messageId, text) {
				if (synth === void 0 && typeof fetch !== "function") return false;
				const chunks = chunkText(text);
				if (chunks.length === 0) return false;
				this.stop();
				const token = ++this.token;
				this.chunks = chunks;
				this.lang = detectLang(text);
				this.publish({ messageId, error: null });
				const pending = ++this.pendingStarts;
				// Prefer the host renderer, but never block on the probe: a page
				// without a host route falls back to the browser engine.
				probeHost().then((host) => {
					if (token !== this.token || pending !== this.pendingStarts) return;
					window.setTimeout(() => {
						if (token !== this.token || pending !== this.pendingStarts) return;
						if (host !== null) this.speakHost(token, 0, host.base);
						else this.step(token, 0);
					}, 0);
				});
				return true;
			},
			/**
			* Fetch and play one chunk from the host renderer, chaining the next.
			* @param token - the run token; a stale token abandons the chain.
			* @param index - the chunk to play.
			* @param base - the host route prefix.
			*/
			speakHost(token, index, base) {
				if (token !== this.token) return;
				if (index >= this.chunks.length) {
					this.stop();
					return;
				}
				const voice = preferences.voice;
				request(`${base}/speak`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						text: this.chunks[index],
						voice,
						rate: preferences.rate
					})
				}).then((response) => {
					if (token !== this.token) return;
					if (!response.ok) throw new Error(`tts-${response.status}`);
					return response.blob();
				}).then((blob) => {
					if (token !== this.token || blob === void 0) return;
					const url = URL.createObjectURL(blob);
					const element = new Audio(url);
					audio = element;
					element.onended = () => {
						URL.revokeObjectURL(url);
						if (token === this.token) this.speakHost(token, index + 1, base);
					};
					element.onerror = () => {
						URL.revokeObjectURL(url);
						if (token !== this.token) return;
						this.stop();
						this.fail("engine");
					};
					element.play().catch((error) => {
						URL.revokeObjectURL(url);
						if (token !== this.token) return;
						console.warn("[ui-read-aloud] playback blocked:", error);
						this.stop();
						this.fail("engine");
					});
				}).catch((error) => {
					if (token !== this.token) return;
					console.warn("[ui-read-aloud] host synthesis failed:", error);
					this.stop();
					this.fail("engine");
				});
			},
			/** Speak one chunk and chain the next one from its completion. */
			step(token, index) {
				if (token !== this.token) return;
				if (index >= this.chunks.length) {
					this.stop();
					return;
				}
				const utterance = new SpeechSynthesisUtterance(this.chunks[index]);
				utterance.lang = this.lang;
				const voice = pickVoice(this.lang);
				if (voice !== void 0) utterance.voice = voice;
				// The browser engine takes a multiplier, so translate the chosen
				// percentage to match what the host renderer would do.
				utterance.rate = browserRate(preferences.rate);
				utterance.pitch = 1;
				utterance.onend = () => {
					if (token === this.token) this.step(token, index + 1);
				};
				utterance.onerror = (event) => {
					if (token !== this.token) return;
					const reason = event && event.error ? event.error : "";
					if (reason === "interrupted" || reason === "canceled") return;
					console.warn("[ui-read-aloud] utterance failed:", reason);
					this.stop();
					this.fail("engine");
				};
				try {
					synth.speak(utterance);
				} catch (error) {
					console.warn("[ui-read-aloud] speak failed:", error);
					this.stop();
					this.fail("engine");
				}
			}
		};
		//#endregion

		//#region message text
		/**
		* Read the closing Assistant text of the turn that owns one message id.
		* @param snapshot - the Chat projection snapshot.
		* @param messageId - the assistant message addressed by the action strip.
		* @returns the markdown text, or an empty string while the projection is cold.
		*/
		function messageText(snapshot, messageId) {
			if (snapshot === null || snapshot === void 0) return "";
			const timeline = snapshot.timeline;
			const turns = timeline === null || timeline === void 0 ? void 0 : timeline.turns;
			if (turns === null || turns === void 0 || typeof turns.values !== "function") return "";
			for (const turn of turns.values()) {
				const data = turn === null || turn === void 0 ? void 0 : turn.data;
				if (data === null || data === void 0 || typeof data.get !== "function") continue;
				const tail = data.get("turn-tail");
				const closing = tail === null || tail === void 0 ? void 0 : tail.closing;
				if (closing === null || closing === void 0) continue;
				const finalNode = closing.finalNode;
				if (finalNode === null || finalNode === void 0 || finalNode.messageId !== messageId) continue;
				const blocks = closing.blocks;
				if (!Array.isArray(blocks)) return "";
				const parts = [];
				for (const block of blocks) if (block !== null && block !== void 0 && block.kind === "text" && typeof block.text === "string") parts.push(block.text);
				return parts.join("\n\n");
			}
			return "";
		}
		/** Hook seat used when the Chat hook is absent from this slot kit. */
		function emptyHook() {
			return "";
		}
		//#endregion

		//#region preferences
		const PREF_KEY = "dsh.readAloud.auto";
		/** Versioned so a value stored under an older default cannot pin the old voice. */
		const VOICE_KEY = "dsh.readAloud.voice.v2";
		const LEGACY_VOICE_KEY = "dsh.readAloud.voice";
		/** Speaking speed, persisted per browser. */
		const RATE_KEY = "dsh.readAloud.rate";
		/** The preferred voice for this profile. */
		const DEFAULT_VOICE = "zh-CN-YunjianNeural";
		/**
		* Neural voices read slowly by default, which drags on long replies.
		* +18% stays clear while cutting the reading time noticeably.
		*/
		const DEFAULT_RATE = "+18%";
		/** Rates offered in the picker, slowest first. */
		const RATES = [
			{ id: "-20%", label: "慢" },
			{ id: "+0%", label: "正常" },
			{ id: "+18%", label: "快" },
			{ id: "+35%", label: "更快" }
		];
		/** Whether finished replies are read without a click; stored per browser. */
		const preferences = {
			auto: false,
			voice: DEFAULT_VOICE,
			rate: DEFAULT_RATE,
			listeners: /* @__PURE__ */ new Set(),
			getSnapshot() {
				return this.auto;
			},
			subscribe(listener) {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			},
			load() {
				try {
					this.auto = window.localStorage.getItem(PREF_KEY) === "1";
					const stored = window.localStorage.getItem(VOICE_KEY);
					// Carry a choice made under the retired key forward once, so the
					// versioned key starts from what the user actually picked.
					const legacy = window.localStorage.getItem(LEGACY_VOICE_KEY);
					if (legacy !== null) window.localStorage.removeItem(LEGACY_VOICE_KEY);
					if (stored !== null && stored !== "") this.voice = stored;
					else if (legacy !== null && legacy !== "") {
						this.voice = legacy;
						window.localStorage.setItem(VOICE_KEY, legacy);
					}
					const rate = window.localStorage.getItem(RATE_KEY);
					if (rate !== null && RATES.some((entry) => entry.id === rate)) this.rate = rate;
				} catch (error) {
					console.warn("[ui-read-aloud] preference read failed:", error);
				}
				return this.auto;
			},
			/** Choose the neural voice the host renders with. */
			setVoice(next) {
				if (typeof next !== "string" || next === "") return;
				this.voice = next;
				try {
					window.localStorage.setItem(VOICE_KEY, next);
				} catch (error) {
					console.warn("[ui-read-aloud] voice write failed:", error);
				}
				for (const listener of this.listeners) try {
					listener();
				} catch (error) {
					console.error("[ui-read-aloud] subscriber threw:", error);
				}
			},
			/** Choose the speaking speed the host renders with. */
			setRate(next) {
				if (typeof next !== "string" || !RATES.some((entry) => entry.id === next)) return;
				this.rate = next;
				try {
					window.localStorage.setItem(RATE_KEY, next);
				} catch (error) {
					console.warn("[ui-read-aloud] rate write failed:", error);
				}
				for (const listener of this.listeners) try {
					listener();
				} catch (error) {
					console.error("[ui-read-aloud] subscriber threw:", error);
				}
			},
			set(next) {
				if (this.auto === next) return;
				this.auto = next;
				try {
					window.localStorage.setItem(PREF_KEY, next ? "1" : "0");
				} catch (error) {
					console.warn("[ui-read-aloud] preference write failed:", error);
				}
				for (const listener of this.listeners) try {
					listener();
				} catch (error) {
					console.error("[ui-read-aloud] subscriber threw:", error);
				}
			}
		};
		preferences.load();
		//#endregion

		//#region component
		/**
		* The speaker glyph: waves while idle, a stop square while reading.
		* @param props - whether this reply is the one being read.
		* @returns the sized glyph.
		*/
		function SpeakerIcon({ speaking }) {
			const paths = speaking ? [(0, react_jsx_runtime.jsx)("rect", {
				x: "10.6",
				y: "6.2",
				width: "3.4",
				height: "3.4",
				rx: "0.7",
				fill: "currentColor",
				stroke: "none"
			}, "stop")] : [(0, react_jsx_runtime.jsx)("path", {
				key: "w1",
				className: cls.wave,
				d: "M10.4 6.2a2.7 2.7 0 0 1 0 3.6"
			}), (0, react_jsx_runtime.jsx)("path", {
				key: "w2",
				className: `${cls.wave} ${cls.wave2}`,
				d: "M12.2 4.7a5 5 0 0 1 0 6.6"
			})];
			return (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 16 16",
				width: "100%",
				height: "100%",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.55",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": true,
				focusable: "false",
				children: [(0, react_jsx_runtime.jsx)("path", {
					d: "M3.2 6.1h2.1L8.3 3.6v8.8L5.3 9.9H3.2z"
				}), paths]
			});
		}
		/**
		* The auto-read toggle glyph: a speaker with a loop arc, filled when on.
		* @param props - whether auto reading is enabled.
		* @returns the sized glyph.
		*/
		function AutoIcon({ active }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 16 16",
				width: "100%",
				height: "100%",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.55",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": true,
				focusable: "false",
				children: [
					(0, react_jsx_runtime.jsx)("path", {
						d: "M2.4 6.2h1.7L6.6 3.9v8.2L4.1 9.8H2.4z",
						fill: active ? "currentColor" : "none"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M8.6 6.4a2.6 2.6 0 0 1 0 3.2"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M10.9 4.2a6.2 6.2 0 0 1 0 7.6",
						opacity: active ? "1" : ".45"
					})
				]
			});
		}
		/**
		* Read-aloud control in the finalized assistant message's action strip.
		* @param props - the owner's message id, the Chat hook seat, and the locale seat.
		* @returns the speaker button with any transient hint beside it.
		*/
		function ReadAloudAction({ messageId, useChat, t }) {
			const chatHook = typeof useChat === "function" ? useChat : emptyHook;
			const markdown = chatHook((snapshot) => messageText(snapshot, messageId));
			const [snapshot, setSnapshot] = (0, react.useState)(() => speaker.getSnapshot());
			(0, react.useEffect)(() => speaker.subscribe(() => {
				setSnapshot(speaker.getSnapshot());
			}), []);
			const speaking = snapshot.messageId === messageId;
			const label = speaking ? t("action.stop") : t("action.read");
			// A finished reply is read once when auto is on and nothing else is
			// already speaking; the ref makes each message id read at most once.
			const announced = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (!preferences.getSnapshot()) return;
				const text = toSpeechText(markdown);
				if (text === "") return;
				if (announced.current === messageId) return;
				announced.current = messageId;
				if (speaker.getSnapshot().messageId !== null) return;
				speaker.speak(messageId, text);
			}, [markdown, messageId]);
			const onToggle = (0, react.useCallback)(() => {
				if (speaking) {
					speaker.stop();
					return;
				}
				const text = toSpeechText(markdown);
				if (text === "") {
					speaker.fail("empty");
					return;
				}
				if (!speaker.speak(messageId, text)) speaker.fail(synth === void 0 ? "unsupported" : "empty");
			}, [markdown, messageId, speaking]);
			const hint = snapshot.error === null ? null : t(`error.${snapshot.error}`);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
				children: [(0, react_jsx_runtime.jsx)("span", {
					className: cls.actions,
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
						label,
						side: "bottom",
						children: (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: cls.action,
							"aria-label": label,
							"aria-pressed": speaking,
							"data-speaking": speaking || void 0,
							onClick: onToggle,
							children: (0, react_jsx_runtime.jsx)(SpeakerIcon, { speaking })
						})
					})
				}), hint !== null && (0, react_jsx_runtime.jsx)("span", {
					className: cls.hint,
					role: "status",
					children: hint
				})]
			});
		}
		/**
		* The auto-read switch, mounted in the Session header's top-right corner so
		* it reads as one page-wide preference rather than a per-message control.
		* @param props - the locale seat.
		* @returns the toggle button.
		*/
		function AutoReadToggle({ t }) {
			const [auto, setAuto] = (0, react.useState)(() => preferences.getSnapshot());
			(0, react.useEffect)(() => preferences.subscribe(() => {
				setAuto(preferences.getSnapshot());
			}), []);
			const label = auto ? t("action.autoOff") : t("action.autoOn");
			const onClick = (0, react.useCallback)(() => {
				const next = !preferences.getSnapshot();
				preferences.set(next);
				if (!next) speaker.stop();
			}, []);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
				children: [(0, react_jsx_runtime.jsx)(VoicePicker, { t }), (0, react_jsx_runtime.jsx)(RatePicker, { t }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
					label,
					side: "bottom",
					children: (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: cls.action,
						"aria-label": label,
						"aria-pressed": auto,
						"data-auto": auto ? "on" : "off",
						onClick,
						children: (0, react_jsx_runtime.jsx)(AutoIcon, { active: auto })
					})
				})]
			});
		}
		/** Voice entries the host advertised, filled in by the first probe. */
		let advertisedVoices = [];
		/**
		* The voice picker, mounted beside the auto-read switch so both read-aloud
		* preferences sit together in the Session header.
		* @param props - the locale seat.
		* @returns the picker, or nothing when the host offers no real choice.
		*/
		function VoicePicker({ t }) {
			const [voice, setVoice] = (0, react.useState)(() => preferences.voice);
			const [choices, setChoices] = (0, react.useState)(() => advertisedVoices);
			(0, react.useEffect)(() => preferences.subscribe(() => {
				setVoice(preferences.voice);
			}), []);
			(0, react.useEffect)(() => {
				let live = true;
				probeHost().then((host) => {
					if (!live || host === null || !Array.isArray(host.voices)) return;
					const usable = host.voices.filter((entry) => entry !== null && entry !== void 0 && typeof entry.id === "string" && entry.id !== "");
					advertisedVoices = usable;
					setChoices(usable);
				});
				return () => {
					live = false;
				};
			}, []);
			const onChange = (0, react.useCallback)((event) => {
				preferences.setVoice(event.target.value);
			}, []);
			if (choices.length < 2) return null;
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: t("action.voice"),
				side: "bottom",
				children: (0, react_jsx_runtime.jsx)("select", {
					className: cls.voice,
					"aria-label": t("action.voice"),
					value: voice,
					onChange,
					children: choices.map((entry) => (0, react_jsx_runtime.jsx)("option", {
						key: entry.id,
						value: entry.id,
						children: entry.label || entry.id
					}, entry.id))
				})
			});
		}
		/**
		* The speaking-speed picker, mounted beside the voice picker.
		* @param props - the locale seat.
		* @returns the picker.
		*/
		function RatePicker({ t }) {
			const [rate, setRate] = (0, react.useState)(() => preferences.rate);
			(0, react.useEffect)(() => preferences.subscribe(() => {
				setRate(preferences.rate);
			}), []);
			const onChange = (0, react.useCallback)((event) => {
				preferences.setRate(event.target.value);
			}, []);
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: t("action.rate"),
				side: "bottom",
				children: (0, react_jsx_runtime.jsx)("select", {
					className: cls.rate,
					"aria-label": t("action.rate"),
					value: rate,
					onChange,
					children: RATES.map((entry) => (0, react_jsx_runtime.jsx)("option", {
						key: entry.id,
						value: entry.id,
						children: entry.label
					}, entry.id))
				})
			});
		}
		//#endregion

		//#region plugin
		/** Dictionary namespace owned by this plugin. */
		const NS = "readAloud";
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"action.read": "朗读",
			"action.stop": "停止朗读",
			"action.autoOn": "开启自动朗读",
			"action.autoOff": "关闭自动朗读",
			"action.voice": "朗读音色",
			"action.rate": "朗读语速",
			"error.empty": "这条回复没有可朗读的文字",
			"error.unsupported": "当前环境不支持语音朗读",
			"error.engine": "朗读失败，请重试"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"action.read": "Read aloud",
			"action.stop": "Stop reading",
			"action.autoOn": "Read replies automatically",
			"action.autoOff": "Stop reading replies automatically",
			"action.voice": "Reading voice",
			"action.rate": "Reading speed",
			"error.empty": "This reply has no text to read",
			"error.unsupported": "Speech is not available in this environment",
			"error.engine": "Could not read this reply"
		};
		/** Required services: the slot registry and the copy dictionaries. */
		const inject = ["slots", "locale"];
		/**
		* Client plugin body: the read-aloud entry in the assistant action strip.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-read-aloud: dictionaries");
			ctx.slots.inject("conversation.chat.assistant-actions", () => ctx.slots.register({
				name: "conversation.chat.assistant-actions",
				id: "read-aloud",
				order: 11,
				locale: NS
			}, ReadAloudAction));
			ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
				name: "conversation.session.header.utilities",
				id: "read-aloud-auto",
				order: 40,
				locale: NS
			}, AutoReadToggle));
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		exports.__internals = { toSpeechText, chunkText, detectLang, messageText };
		return module.exports;
	}
});
