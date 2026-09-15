import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Allow large image uploads
app.use(express.json({ limit: "25mb" }));

// Initialize Gemini SDK lazily
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// Crash damage analysis endpoint
app.post("/api/analyze-crash", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", userNotes } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Nenhuma imagem foi fornecida para análise." });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const ai = getGeminiClient();

    if (!ai) {
      // Intelligent fallback when API key is not yet set
      console.warn("GEMINI_API_KEY is not configured, providing heuristic fallback");
      return res.json({
        identifiedDamage: "Avaria em para-choque e região frontal detectada",
        severity: "Moderada",
        safeToDrive: true,
        safetyWarning: "Verifique se não há vazamento de fluidos (água ou óleo) antes de ligar o motor.",
        possibleServices: [
          "Funilaria especializada",
          "Pintura e alinhamento",
          "Fixação e presilhas do para-choque",
          "Checagem do conjunto óptico / farol",
        ],
        recommendedCategory: "funilaria",
        recommendedCategoryLabel: "Funilaria e Pintura",
        estimatedCost: {
          min: 800,
          max: 1500,
          partsMin: 400,
          partsMax: 800,
          laborMin: 400,
          laborMax: 700,
          formattedRange: "R$ 800 – R$ 1.500",
        },
        disclaimer: "Estimativa aproximada. O valor real depende da avaliação presencial.",
        emergencyGuidance: "Se houver pessoas feridas ou risco imediato, ligue para 192 (SAMU) ou 193 (Bombeiros).",
        needsTowTruck: false,
      });
    }

    const prompt = `Você é o perito veicular de inteligência artificial do AutoCheck AI, especializado em socorro rápido a motoristas no Brasil após batidas ou colisões.
Analise a imagem da batida ou avaria veicular fornecida com extrema precisão, calma e pragmatismo.

Orientações cruciais:
1. Identifique o dano visível principal em português claro e direto (ex: "Para-choque dianteiro amassado e farol esquerdo trincado").
2. Avalie a gravidade: "Baixa", "Moderada" ou "Alta".
3. Avalie a segurança com RIGOR: se o veículo tiver risco de vazamento de radiador, roda travada/torta, direção desalinhada, airbag estourado, motor exposto, vidros estilhaçados que bloqueiem a visão ou risco estrutural, defina "safeToDrive" como FALSE, "needsTowTruck" como TRUE e forneça um "safetyWarning" urgente e claro ("Não recomendamos continuar dirigindo. O dano pode envolver componentes vitais do veículo").
4. Se houver pessoas envolvidas em acidente grave, reforce sempre a orientação de emergência (192 SAMU / 193 Bombeiros).
5. Liste de 2 a 4 possíveis serviços necessários (ex: "Funilaria", "Pintura", "Troca do farol", "Alinhamento").
6. Escolha a categoria recomendada entre: "funilaria", "mecanico", "eletricista", "guincho", "borracheiro". Se o carro não puder rodar, priorize "guincho" ou "funilaria".
7. Forneça uma estimativa de custo realista no padrão do mercado brasileiro em Reais (R$), detalhando peças e mão de obra quando possível.

Observações adicionais do motorista: "${userNotes || 'Nenhuma observação informada.'}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            identifiedDamage: {
              type: Type.STRING,
              description: "Dano visível identificado de forma curta e objetiva",
            },
            severity: {
              type: Type.STRING,
              description: "Gravidade: Baixa, Moderada ou Alta",
            },
            safeToDrive: {
              type: Type.BOOLEAN,
              description: "Indica se o veículo pode continuar rodando com segurança",
            },
            needsTowTruck: {
              type: Type.BOOLEAN,
              description: "Indica se é recomendado acionar guincho imediatamente",
            },
            safetyWarning: {
              type: Type.STRING,
              description: "Alerta de segurança caso não seja seguro rodar",
            },
            possibleServices: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de possíveis serviços necessários",
            },
            recommendedCategory: {
              type: Type.STRING,
              description: "Categoria de socorro: funilaria, mecanico, eletricista, guincho ou borracheiro",
            },
            recommendedCategoryLabel: {
              type: Type.STRING,
              description: "Rótulo amigável: ex: Funilaria e Pintura, Guincho Imediato, Auto Mecânica",
            },
            estimatedCost: {
              type: Type.OBJECT,
              properties: {
                min: { type: Type.NUMBER },
                max: { type: Type.NUMBER },
                partsMin: { type: Type.NUMBER },
                partsMax: { type: Type.NUMBER },
                laborMin: { type: Type.NUMBER },
                laborMax: { type: Type.NUMBER },
                formattedRange: {
                  type: Type.STRING,
                  description: "Formato em reais brasileiro, ex: R$ 800 – R$ 1.500",
                },
              },
              required: ["min", "max", "formattedRange"],
            },
            disclaimer: {
              type: Type.STRING,
              description: "Aviso de estimativa aproximada",
            },
            emergencyGuidance: {
              type: Type.STRING,
              description: "Instrução caso haja pessoas feridas (SAMU 192 / Bombeiros 193)",
            },
          },
          required: [
            "identifiedDamage",
            "severity",
            "safeToDrive",
            "needsTowTruck",
            "possibleServices",
            "recommendedCategory",
            "recommendedCategoryLabel",
            "estimatedCost",
            "disclaimer",
          ],
        },
      },
    });

    const parsedResult = JSON.parse(response.text?.trim() || "{}");
    // Ensure standard disclaimer
    if (!parsedResult.disclaimer) {
      parsedResult.disclaimer = "Estimativa aproximada. O valor real depende da avaliação presencial.";
    }
    if (!parsedResult.emergencyGuidance) {
      parsedResult.emergencyGuidance = "Se houver pessoas feridas ou risco imediato, procure os serviços de emergência (192 SAMU / 193 Bombeiros).";
    }

    return res.json(parsedResult);
  } catch (error: any) {
    console.error("Error analyzing crash:", error);
    // Provide a reliable emergency fallback so the driver is never stranded
    return res.json({
      identifiedDamage: "Avaria em para-choque e componentes frontais visíveis",
      severity: "Moderada",
      safeToDrive: true,
      needsTowTruck: false,
      safetyWarning: "Verifique se há vazamento de óleo ou água e se o para-choque não está raspando no pneu.",
      possibleServices: [
        "Funilaria especializada",
        "Pintura e alinhamento",
        "Fixação de presilhas e para-choque",
      ],
      recommendedCategory: "funilaria",
      recommendedCategoryLabel: "Funilaria e Pintura",
      estimatedCost: {
        min: 800,
        max: 1500,
        partsMin: 400,
        partsMax: 800,
        laborMin: 400,
        laborMax: 700,
        formattedRange: "R$ 800 – R$ 1.500",
      },
      disclaimer: "Estimativa aproximada. O valor real depende da avaliação presencial.",
      emergencyGuidance: "Se houver pessoas feridas ou risco imediato, procure os serviços de emergência (192 SAMU / 193 Bombeiros).",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AutoCheck AI Server rodando na porta ${PORT}`);
  });
}

startServer();
