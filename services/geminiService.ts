import { GoogleGenAI, Type } from "@google/genai";
import { RouteStatus, FreightJob, JobStatus } from "../types";
import { GOOGLE_API_KEY } from "../constants";

const apiKey = process.env.API_KEY || GOOGLE_API_KEY; 
const ai = new GoogleGenAI({ apiKey });

export const generateAssistantResponse = async (
  userMessage: string,
  routeStatus: RouteStatus,
  jobs: FreightJob[]
): Promise<string> => {
  if (!apiKey) {
    return "A chave de API do Gemini não foi encontrada.";
  }

  const pendingJobs = jobs.filter(j => j.status === JobStatus.PENDING).map(j => j.cargoType).join(', ');
  const completedJobs = jobs.filter(j => j.status === JobStatus.DELIVERED).map(j => j.cargoType).join(', ');

  const systemInstruction = `
    Você é a "MudançaIA", uma assistente especializada em logística, carretos e mudanças residenciais.
    
    Contexto Atual do Caminhão:
    - Status: ${routeStatus.isActive ? "Em trânsito para entrega" : "Aguardando novas ordens"}
    - Próximo Destino: ${routeStatus.nextStop}
    - Cargas Pendentes: ${pendingJobs || "Nenhuma"}
    - Cargas Entregues: ${completedJobs || "Nenhuma"}
    
    Seu objetivo é ajudar clientes e motoristas.
    Para clientes: Dê dicas de embalagem, segurança da carga e estimativas de tempo.
    Para motoristas: Dê dicas de rota, acomodação de carga no baú e segurança.
    Seja prático e direto.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 200,
      }
    });

    return response.text || "Desculpe, não consegui consultar a central logística.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sistema offline. Verifique sua conexão.";
  }
};

export const optimizeRoute = async (jobs: FreightJob[]): Promise<string[]> => {
  if (!apiKey) {
    console.warn("API Key missing for route optimization");
    return jobs.map(j => j.id);
  }

  const jobData = jobs.map(j => ({ id: j.id, address: j.address, weight: j.weight }));
  
  const prompt = `
    You are a logistics coordinator. Optimize the delivery route for these jobs.
    Consider heavy items might need to be unloaded first if they block others, or last if they are deep in the truck.
    Assume simple TSP (Travel Salesman Problem) for distance.
    
    Jobs: ${JSON.stringify(jobData)}
    
    Return ONLY a JSON array containing the job IDs in the optimized order.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return jobs.map(j => j.id);

    const orderedIds = JSON.parse(jsonText);
    return Array.isArray(orderedIds) ? orderedIds : jobs.map(j => j.id);
  } catch (error) {
    console.error("Route optimization error:", error);
    return jobs.map(j => j.id);
  }
};