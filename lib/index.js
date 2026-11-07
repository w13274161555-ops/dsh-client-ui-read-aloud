/**
 * Host half of the read-aloud plugin: renders speech with the bundled
 * `msedge-tts` client and serves the audio to the page.
 *
 * The browser cannot reach the Edge endpoint directly (it needs a signed
 * Sec-MS-GEC token and an extension origin), so synthesis runs here. A
 * loopback-only server does the work and a `/dsh-read-aloud` route on the
 * existing web server exposes it, so nothing binds publicly and no Python
 * install is required.
 */
import { createServer } from 'node:http';
import { request as httpRequest } from 'node:http';

/** Route prefix the page probes. */
const ROUTE = '/dsh-read-aloud';

/** Default voice: the most natural mainland Chinese female voice. */
const DEFAULT_VOICE = 'zh-CN-XiaoxiaoNeural';

/**
 * Default speaking rate. Neural voices read slowly by default, which drags on
 * long technical replies; +18% keeps every syllable clear while cutting the
 * reading time noticeably.
 */
const DEFAULT_RATE = '+18%';

/** Accepted prosody rate strings, bounded so a typo cannot make speech unusable. */
const RATE_PATTERN = /^[+-]\d{1,2}%$/;

/** Voices the page may choose from. */
const VOICES = [
  { id: 'zh-CN-XiaoxiaoNeural', label: '晓晓（女声，自然）' },
  { id: 'zh-CN-YunxiNeural', label: '云希（男声，自然）' },
  { id: 'zh-CN-YunyangNeural', label: '云扬（男声，播报）' },
  { id: 'zh-CN-XiaoyiNeural', label: '晓伊（女声，活泼）' },
  { id: 'zh-CN-YunjianNeural', label: '云健（男声，沉稳）' },
  { id: 'zh-CN-liaoning-XiaobeiNeural', label: '晓北（东北话）' },
  { id: 'zh-CN-shaanxi-XiaoniNeural', label: '晓妮（陕西话）' },
];

/** Hard ceiling on one request so a runaway page cannot exhaust the renderer. */
const MAX_TEXT = 8000;
/** Synthesis timeout per request. */
const TIMEOUT_MS = 30000;

/** Read one JSON request body with a size ceiling. */
function readJson(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_TEXT * 8) {
        reject(new Error('body-too-large'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch (error) {
        reject(error);
      }
    });
    request.on('error', reject);
  });
}

/**
 * Create the synthesizer, loading `msedge-tts` lazily so a broken install only
 * disables the neural path instead of failing the whole plugin row.
 * @returns a `synthesize(text, voice)` function, or undefined.
 */
async function createSynthesizer() {
  let mod;
  try {
    mod = await import('msedge-tts');
  } catch {
    return undefined;
  }
  const { MsEdgeTTS, OUTPUT_FORMAT } = mod;
  if (typeof MsEdgeTTS !== 'function') return undefined;

  // One client per voice, reused so repeated replies do not re-handshake.
  const clients = new Map();

  const clientFor = async (voice) => {
    const existing = clients.get(voice);
    if (existing !== undefined) return existing;
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    clients.set(voice, tts);
    return tts;
  };

  return {
    /**
     * Render one chunk of speech.
     * @param text - text to speak.
     * @param voice - neural voice id.
     * @param rate - prosody speed such as `+15%`; empty keeps the voice default.
     * @returns MP3 bytes.
     */
    async synthesize(text, voice, rate) {
      const tts = await clientFor(voice);
      const { audioStream } = tts.toStream(text, rate === '' ? undefined : { rate });
      const chunks = [];
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          audioStream.destroy();
          reject(new Error('tts-timeout'));
        }, TIMEOUT_MS);
        audioStream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        audioStream.on('end', () => {
          clearTimeout(timer);
          resolve();
        });
        audioStream.on('error', (error) => {
          clearTimeout(timer);
          reject(error);
        });
      });
      return Buffer.concat(chunks);
    },
    /** Drop every pooled client. */
    dispose() {
      for (const tts of clients.values()) {
        try {
          tts.close();
        } catch {}
      }
      clients.clear();
    },
  };
}

/**
 * Host plugin body: start the renderer and expose it on the web server.
 * @param ctx - host cordis context.
 */
export function apply(ctx) {
  const state = { voice: DEFAULT_VOICE, rate: DEFAULT_RATE };
  /** Resolved lazily on the first request so startup never waits on the network. */
  let synthesizer;

  const server = createServer(async (request, response) => {
    const send = (status, body, type = 'application/json') => {
      response.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
      response.end(body);
    };

    if (request.method === 'GET' && request.url === '/voices') {
      return send(200, JSON.stringify({ engine: 'edge-tts', voices: VOICES, voice: state.voice, rate: state.rate }));
    }
    if (request.method !== 'POST' || request.url !== '/speak') {
      return send(404, JSON.stringify({ error: 'not-found' }));
    }

    let body;
    try {
      body = await readJson(request);
    } catch (error) {
      return send(400, JSON.stringify({ error: 'bad-request', message: String(error?.message ?? error) }));
    }

    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    if (text === '') return send(400, JSON.stringify({ error: 'empty-text' }));
    if (text.length > MAX_TEXT) return send(413, JSON.stringify({ error: 'text-too-long' }));

    const voice = typeof body.voice === 'string' && VOICES.some((entry) => entry.id === body.voice) ? body.voice : state.voice;
    // An explicit rate lets the page change speed; an absent or malformed one
    // falls back to the default rather than failing the request.
    const rate = typeof body.rate === 'string' && RATE_PATTERN.test(body.rate) ? body.rate : state.rate;

    try {
      synthesizer ??= createSynthesizer();
      const engine = await synthesizer;
      if (engine === undefined) return send(503, JSON.stringify({ error: 'no-engine' }));
      const audio = await engine.synthesize(text, voice, rate);
      if (audio.length === 0) return send(502, JSON.stringify({ error: 'empty-audio' }));
      return send(200, audio, 'audio/mpeg');
    } catch (error) {
      return send(500, JSON.stringify({ error: 'synthesis-failed', message: String(error?.message ?? error) }));
    }
  });

  const ready = new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });

  ctx.effect(() => () => {
    server.close();
    Promise.resolve(synthesizer).then((engine) => engine?.dispose?.()).catch(() => {});
  }, 'ui-read-aloud: tts server');

  // `inject` must run while apply() is still on the stack, so the route handler
  // awaits the port instead of registering from a promise callback.
  ctx.inject(['webServer'], (webCtx) => {
    webCtx.effect(() => webCtx.webServer.register({
      kind: 'prefix',
      path: ROUTE,
      handler: async (request, response) => {
        const port = await ready;
        const path = request.url.replace(new RegExp(`^${ROUTE}`), '') || '/';
        // Buffer the raw bytes before forwarding: re-encoding a decoded string
        // corrupts multi-byte UTF-8.
        const chunks = [];
        request.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        request.on('error', () => {
          if (!response.headersSent) response.writeHead(400);
          response.end();
        });
        request.on('end', () => {
          const body = Buffer.concat(chunks);
          const headers = { ...request.headers, host: `127.0.0.1:${port}`, 'content-length': String(body.length) };
          delete headers['transfer-encoding'];
          const upstream = httpRequest({ host: '127.0.0.1', port, path, method: request.method, headers }, (answer) => {
            response.writeHead(answer.statusCode ?? 502, answer.headers);
            answer.pipe(response);
          });
          upstream.on('error', () => {
            if (!response.headersSent) response.writeHead(502);
            response.end();
          });
          upstream.end(body);
        });
      },
    }), 'ui-read-aloud: tts route');
  });
}

export default { apply };
