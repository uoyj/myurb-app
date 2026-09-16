const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.2.115:8000';

export interface Linha {
  id: number;
  codigo: string;
  nome: string;
  origem: string | null;
  destino: string | null;
  cor: string | null;
  [key: string]: any;
}

export interface Ponto {
  id: number;
  codigo: string;
  latitude: number;
  longitude: number;
  descricao: string;
  [key: string]: any;
}

export interface HorarioItem {
  id: number;
  ponto_id: number;
  dia_semana: string; // "1" = segunda, "2" = terça, etc.
  hora: string;       // "05:56"
  [key: string]: any;
}

class LinhaService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  async getLinhas(): Promise<Linha[]> {
    const response = await fetch(`${this.baseUrl}/linhas`);
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : data.linhas || data.data || [];
  }

  async getLinhaById(codigo: string): Promise<Linha> {
    // A API não tem endpoint de detalhe individual, então reaproveitamos getLinhas
    // e filtramos client-side. Futuro: se a API adicionar /linhas/{codigo}, trocar aqui.
    const linhas = await this.getLinhas();
    const linha = linhas.find((l) => l.codigo === codigo);
    if (!linha) {
      throw new Error(`Linha ${codigo} não encontrada`);
    }
    return linha;
  }

  async getPontosByLinha(codigo: string): Promise<Ponto[]> {
    const response = await fetch(`${this.baseUrl}/linhas/${codigo}/pontos`);
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : data.pontos || data.data || [];
  }

  async getHorariosPonto(codigoPonto: string): Promise<HorarioItem[]> {
    const response = await fetch(`${this.baseUrl}/pontos/${codigoPonto}/horarios`);
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : data.horarios || data.data || [];
  }
}

export const linhaService = new LinhaService(API_BASE_URL);
