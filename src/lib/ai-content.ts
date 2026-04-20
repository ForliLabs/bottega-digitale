// AI-Powered Social Media Content Generator
// Configure with OPENAI_API_KEY env var

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

interface GeneratePostParams {
  businessName: string;
  businessCategory: string;
  city: string;
  imageDescription?: string;
  occasion?: string;
  platform: "instagram" | "facebook";
}

interface GeneratedPost {
  caption: string;
  hashtags: string[];
}

export async function generateSocialPost(params: GeneratePostParams): Promise<GeneratedPost> {
  if (!OPENAI_API_KEY) {
    // Fallback: generate a simple template-based post
    return generateTemplatePost(params);
  }

  const systemPrompt = `Sei un esperto di social media marketing per piccole attività italiane. 
Genera post in italiano, informali ma professionali, con emoji appropriate.
Rispondi SOLO in formato JSON: {"caption": "...", "hashtags": ["...", "..."]}`;

  const userPrompt = `Genera un post ${params.platform} per:
- Attività: ${params.businessName} (${params.businessCategory})
- Città: ${params.city}
${params.imageDescription ? `- Foto: ${params.imageDescription}` : ""}
${params.occasion ? `- Occasione: ${params.occasion}` : ""}
Includi 5-8 hashtag pertinenti in italiano.`;

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 500,
    }),
  });

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";

  try {
    return JSON.parse(content);
  } catch {
    return { caption: content, hashtags: [] };
  }
}

// Template-based fallback when OpenAI is not configured
function generateTemplatePost(params: GeneratePostParams): GeneratedPost {
  const templates: Record<string, string[]> = {
    barbiere: [
      `✂️ Taglio fresco da ${params.businessName}! Prenota il tuo appuntamento online.`,
      `💈 Nuovo look? Passa da ${params.businessName} a ${params.city}!`,
      `🧔 La barba perfetta esiste — vieni a scoprirla da noi!`,
    ],
    forno: [
      `🍞 Sfornati oggi da ${params.businessName}! Vieni a sentire il profumo.`,
      `🥐 Colazione perfetta? Solo da ${params.businessName} a ${params.city}.`,
    ],
    ristorante: [
      `🍝 Il piatto del giorno ti aspetta da ${params.businessName}!`,
      `🍷 Serata speciale a ${params.city}? Prenota il tuo tavolo!`,
    ],
    default: [
      `⭐ Novità da ${params.businessName} a ${params.city}! Vieni a scoprirle.`,
      `📍 Siamo in ${params.city} — passa a trovarci da ${params.businessName}!`,
    ],
  };

  const category = params.businessCategory.toLowerCase();
  const matchedTemplates = Object.entries(templates).find(([key]) =>
    category.includes(key)
  )?.[1] || templates.default;

  const caption = matchedTemplates[Math.floor(Math.random() * matchedTemplates.length)];
  const hashtags = [
    `#${params.businessName.replace(/\s+/g, "").toLowerCase()}`,
    `#${params.city.toLowerCase()}`,
    `#${params.businessCategory.replace(/\s+/g, "").toLowerCase()}`,
    "#artigianato",
    "#madeinitaly",
    "#bottegadigitale",
  ];

  return { caption, hashtags };
}

// Content calendar suggestions by business type
export function getWeeklyContentSuggestions(businessCategory: string): string[] {
  const suggestions: Record<string, string[]> = {
    barbiere: [
      "Lunedì: Post motivazionale 'Nuova settimana, nuovo look'",
      "Mercoledì: Prima/dopo di un taglio della settimana",
      "Venerdì: Promozione weekend o last-minute slot",
      "Sabato: Story dietro le quinte del negozio",
    ],
    forno: [
      "Lunedì: Foto del primo sfornamento della settimana",
      "Mercoledì: Ricetta della tradizione romagnola",
      "Venerdì: Specialità del weekend",
      "Domenica: Reel preparazione impasto",
    ],
    default: [
      "Lunedì: Novità della settimana",
      "Mercoledì: Prodotto/servizio in evidenza",
      "Venerdì: Promozione weekend",
      "Sabato: Ringraziamento clienti della settimana",
    ],
  };

  const category = businessCategory.toLowerCase();
  const matched = Object.entries(suggestions).find(([key]) =>
    category.includes(key)
  );
  return matched?.[1] || suggestions.default;
}

export function isAIConfigured(): boolean {
  return !!OPENAI_API_KEY;
}
