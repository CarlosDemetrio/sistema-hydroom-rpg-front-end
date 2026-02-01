import { Injectable, inject, computed } from '@angular/core';
import { JogosStore } from '../../../core/stores/jogos.store';
import { FichasStore } from '../../../core/stores/fichas.store';
import { JogosApiService } from '../../../core/services/api/jogos-api.service';
import { Jogo, JogoStatus } from '../../../core/models/jogo.model';
import { Participante } from '../../../core/models/participante.model';

/**
 * Jogo Management Facade Service
 *
 * ✅ ARQUITETURA CORRETA:
 * Component → Facade → API Service → Backend
 *                ↓ (response)
 *            Store.setState()
 */
@Injectable({
  providedIn: 'root'
})
export class JogoManagementFacadeService {
  private jogosStore = inject(JogosStore);
  private fichasStore = inject(FichasStore);
  private jogosApi = inject(JogosApiService);

  // Exposed state (read-only)
  jogos = this.jogosStore.jogos;
  loading = this.jogosStore.loading;
  error = this.jogosStore.error;

  // Computed stats
  totalJogos = computed(() => this.jogosStore.jogos().length);

  totalJogadores = computed(() => {
    const jogos = this.jogosStore.jogos();
    const uniqueJogadores = new Set<number>();
    jogos.forEach(jogo => {
      jogo.participantes?.forEach(p => {
        if (p.jogadorId) uniqueJogadores.add(p.jogadorId);
      });
    });
    return uniqueJogadores.size;
  });

  jogosRecentes = computed(() => {
    return this.jogosStore.jogos()
      .slice()
      .sort((a, b) => new Date(b.dataCriacao || 0).getTime() - new Date(a.dataCriacao || 0).getTime())
      .slice(0, 5);
  });

  // ============================================
  // LOAD METHODS (API → Store)
  // ⚠️ Loading e Error gerenciados automaticamente pelos interceptors
  // ============================================

  async loadJogos(filters?: { status?: JogoStatus; search?: string }) {
    const jogos = await this.jogosApi.listJogos(filters);
    this.jogosStore.setJogos(jogos);
  }

  async loadParticipantes(jogoId: number) {
    const participantes = await this.jogosApi.listParticipantes(jogoId);
    this.jogosStore.setParticipantes(jogoId, participantes);
  }

  // ============================================
  // CRUD METHODS (API → Store)
  // ⚠️ Loading e Error gerenciados automaticamente pelos interceptors
  // ============================================

  async createJogo(data: { nome: string; descricao?: string; status?: JogoStatus }) {
    const novoJogo = await this.jogosApi.createJogo(data);
    this.jogosStore.addJogo(novoJogo);
    return novoJogo;
  }

  async updateJogo(id: number, data: Partial<Jogo>) {
    const jogoAtualizado = await this.jogosApi.updateJogo(id, data);
    this.jogosStore.updateJogoInState(id, jogoAtualizado);
    return jogoAtualizado;
  }

  async deleteJogo(id: number) {
    await this.jogosApi.deleteJogo(id);
    this.jogosStore.removeJogo(id);
  }

  // ============================================
  // PARTICIPANTE MANAGEMENT (API → Store)
  // ============================================

  async aprovarParticipante(jogoId: number, participanteId: number) {
    const updated = await this.jogosApi.updateParticipante(jogoId, participanteId, 'APROVADO');
    this.jogosStore.updateParticipanteInState(jogoId, participanteId, updated);
  }

  async rejeitarParticipante(jogoId: number, participanteId: number) {
    const updated = await this.jogosApi.updateParticipante(jogoId, participanteId, 'REJEITADO');
    this.jogosStore.updateParticipanteInState(jogoId, participanteId, updated);
  }

  async removerParticipante(jogoId: number, participanteId: number) {
    await this.jogosApi.removerParticipante(jogoId, participanteId);
    this.jogosStore.removeParticipante(jogoId, participanteId);
  }

  // GETTERS
  getJogo(id: number): Jogo | undefined {
    return this.jogosStore.jogos().find(j => j.id === id);
  }

  getParticipantes(jogoId: number): Participante[] {
    return this.jogosStore.getParticipantes(jogoId);
  }

  getParticipantesAprovados(jogoId: number): Participante[] {
    return this.getParticipantes(jogoId).filter(p => p.status === 'APROVADO');
  }

  getParticipantesPendentes(jogoId: number): Participante[] {
    return this.getParticipantes(jogoId).filter(p => p.status === 'PENDENTE');
  }

  getFichasDoJogo(jogoId: number) {
    return this.fichasStore.fichas().filter(f => f.jogoId === jogoId);
  }

  // FILTER (client-side)
  filterJogos(jogos: Jogo[], searchTerm: string, status?: JogoStatus): Jogo[] {
    let filtered = jogos;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(j =>
        j.nome.toLowerCase().includes(search) ||
        j.descricao?.toLowerCase().includes(search)
      );
    }
    if (status) {
      filtered = filtered.filter(j => j.status === status);
    }
    return filtered;
  }
}
