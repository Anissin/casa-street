import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  createInitialCmsState,
  getPublicMenuCategories,
  getPublicSocialLinks,
  type CmsState,
} from './src/lib/cms.ts';

const PORT = Number(process.env.PORT || 3000);
const CMS_DATA_FILE = path.resolve(process.cwd(), '.casa-cms-state.json');

function loadCmsState(): CmsState {
  try {
    if (fs.existsSync(CMS_DATA_FILE)) {
      const raw = fs.readFileSync(CMS_DATA_FILE, 'utf-8');
      return JSON.parse(raw) as CmsState;
    }
  } catch (err) {
    console.warn('Could not read persisted CMS file, using initial verified state:', err);
  }
  return createInitialCmsState();
}

function saveCmsState(state: CmsState): void {
  try {
    fs.writeFileSync(CMS_DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist CMS file to disk:', err);
  }
}

let currentCmsState: CmsState = loadCmsState();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function buildKitchenSystemInstruction(state: CmsState): string {
  const publicCategories = getPublicMenuCategories(state);
  const publicLinks = getPublicSocialLinks(state);
  const hasFrenchTacos = publicCategories.some((c) => c.id === 'french-tacos');

  const menuSummary = publicCategories
    .map(
      (cat) =>
        `- ${cat.title} (${cat.priority}): ${cat.items
          .map((item) =>
            item.verifiedPrice ? `${item.name} (${item.verifiedPrice})` : item.name
          )
          .join(', ')}`
    )
    .join('\n');

  const linksSummary = publicLinks
    .map((l) => `- ${l.label}: ${l.url}`)
    .join('\n');

  return `You are the Casa Street Kitchen Concierge at The Food District, 145-147 Edgware Road, Paddington, London W2 2HR.
Your personality is energetic, welcoming, direct, and grounded strictly in verified Casa Street facts.

BRAND IDENTITY:
- Casa Street is a 100% Halal Moroccan street-food vendor inside The Food District on Edgware Road, Paddington, London.
- Core focus: oversized Moroccan baguette sandwiches (Casablanca £11.70, Tangier £11.70, Fes £11.70, Marrakesh £12.75, Rabat £12.75), Signature Firma Wrap (£11.00), and flaky laminated Msemen (£7.50 with Nutella, Pistachio, or Amlou).
- Secondary classics: Chicken Tajine (£16.75), Moroccan Mint Tea (£2.50-£4.00), Royal Avocado Juice (£5.50-£6.50), Poms, Slim Citron, Hammoud, and Hawai.
- NEVER confuse Casa Street with "The Taco House" (a separate Food District vendor).
- Direct customers to Uber Eats or Deliveroo Paddington for live ordering and availability.

CURRENTLY PUBLISHED MENU CATEGORIES:
${menuSummary}

FRENCH TACOS STATUS:
${
  hasFrenchTacos
    ? 'French Tacos are CONFIRMED and PUBLISHED by the owner.'
    : 'French Tacos are currently an UNPUBLISHED DRAFT awaiting owner confirmation. Do NOT claim Casa Street currently sells French Tacos.'
}

VERIFIED PUBLIC LINKS:
${linksSummary}

Keep responses concise (2-4 short sentences unless the guest asks for a detailed breakdown), helpful, and accurate.`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '12mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, brand: currentCmsState.brand.name });
  });

  // CMS endpoints
  app.get('/api/cms', (_req, res) => {
    res.json(currentCmsState);
  });

  app.put('/api/cms', (req, res) => {
    const incoming = req.body as CmsState;
    if (
      !incoming ||
      !Array.isArray(incoming.socialLinks) ||
      !Array.isArray(incoming.menuCategories) ||
      !Array.isArray(incoming.socialPosts)
    ) {
      res.status(400).json({ error: 'Invalid CMS payload structure.' });
      return;
    }
    currentCmsState = incoming;
    saveCmsState(currentCmsState);
    res.json(currentCmsState);
  });

  app.post('/api/cms/reset', (_req, res) => {
    currentCmsState = createInitialCmsState();
    saveCmsState(currentCmsState);
    res.json(currentCmsState);
  });

  // Multi-turn Gemini Kitchen Concierge chat
  app.post('/api/chat', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error:
          'GEMINI_API_KEY is not configured in this environment. Set it in Settings > Secrets to enable the Kitchen Concierge.',
      });
      return;
    }

    const { messages } = req.body as {
      messages?: Array<{ role: 'user' | 'model'; text: string }>;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Conversation messages are required.' });
      return;
    }

    const latest = messages[messages.length - 1];
    if (!latest || latest.role !== 'user' || !latest.text.trim()) {
      res.status(400).json({ error: 'Latest message must be a non-empty user prompt.' });
      return;
    }

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    try {
      const chat = ai.chats.create({
        model: 'gemini-4-hydrogen',
        history,
        config: {
          systemInstruction: buildKitchenSystemInstruction(currentCmsState),
        },
      });

      const response = await chat.sendMessage({
        message: latest.text,
      });

      res.json({
        reply: response.text ?? 'Ask me about our Casablanca, Tangier, or Marrakesh sandwiches and flaky msemen wraps!',
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Gemini chat request failed.';
      console.error('Gemini chat error:', error);
      res.status(500).json({ error: msg });
    }
  });

  // Multimodal photo understanding & Casa Street gallery verifier
  app.post('/api/analyze-photo', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error:
          'GEMINI_API_KEY is not configured in this environment. Set it in Settings > Secrets to enable Photo Verification.',
      });
      return;
    }

    const { imageBase64, mimeType, contextNote } = req.body as {
      imageBase64?: string;
      mimeType?: string;
      contextNote?: string;
    };

    if (!imageBase64 || !mimeType) {
      res.status(400).json({ error: 'Both imageBase64 and mimeType are required.' });
      return;
    }

    // Strip data URL prefix if provided
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: `Analyze this food photograph for Casa Street (a London Moroccan street-food brand specializing in oversized Moroccan sandwiches, flaky msemen wraps, and secondary traditional tagines).
${contextNote ? `Uploader note: ${contextNote}` : ''}
Check:
1. What dish is shown (e.g., Moroccan khobz sandwich, msemen flatbread wrap, tagine, pressed French tacos, or an unrelated external vendor dish like Mexican hard-shell tacos from The Taco House).
2. Whether this photo belongs in Casa Street's authentic product gallery (false if it looks like Mexican tacos, unrelated vendor branding, blurry/unusable, or non-food).
3. Recommended Casa Street category ('signature-sandwiches', 'msemen-wraps', 'tagines', 'french-tacos', or 'reject').
4. A concise street-food caption (without inventing prices) and quality feedback.`,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedDish: { type: Type.STRING },
              belongsToCasaStreet: { type: Type.BOOLEAN },
              recommendedCategory: { type: Type.STRING },
              qualityVerdict: { type: Type.STRING },
              suggestedCaption: { type: Type.STRING },
              vendorSeparationNote: { type: Type.STRING },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Gemini photo analysis failed.';
      console.error('Gemini photo analysis error:', error);
      res.status(500).json({ error: msg });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Casa Street server running at http://localhost:${PORT}`);
  });
}

startServer();
