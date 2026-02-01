import { Injectable, inject, computed } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { JogoBusinessService } from '../../../core/services/business/jogo-business.service';
import { ParticipanteBusinessService } from '../../../core/services/business/participante-business.service';
import { FichaBusinessService } from '../../../core/services/business/ficha-business.service';
import { Jogo, JogoStatus, Participante } from '../../../core/models';

/**
 * Jogo Management Facade Service
 *
 * ✅ RESPONSABILIDADE ÚNICA: COORDENAÇÃO
 *
 * - Delega para Business Services
 * - Coordena múltiplos services quando necessário
 * - Expõe API simplificada para Components
 *
 * NÃO tem:
 * - Lógica de negócio (está nos Business Services)
 * - Chamadas HTTP diretas (está nos API Services via Business Services)
 * - Manipulação de Store (está nos Business Services)
 */
@Injectable({
  providedIn: 'root'
})
export class JogoManagementFacadeService {
  // Inject Business Services
  private jogoService = inject(JogoBusinessService);
  private participanteService = inject(ParticipanteBusinessService);
  private fichaService = inject(FichaBusinessService);

  // Exposed state (delegação)
  jogos = this.jogoService.jogos;
  loading = this.jogoService.loading;
  error = this.jogoService.error;

  // Computed stats (pode combinar múltiplos services)
  totalJogos = computed(() => this.jogoService.jogos().length);

  totalJogadores = computed(() => {
    const jogos = this.jogoService.jogos();
    const uniqueJogadores = new Set<number>();
    jogos.forEach(jogo => {
      jogo.participantes?.forEach(p => {
        if (p.jogadorId) uniqueJogadores.add(p.jogadorId);
      });
    });
    return uniqueJogadores.size;
  });

  jogosRecentes = computed(() => {
    return this.jogoService.jogos()
      .slice()
      .sort((a, b) => new Date(b.dataCriacao || 0).getTime() - new Date(a.dataCriacao || 0).getTime())
      .slice(0, 5);
  });

  // ============================================
  // DELEGAÇÃO SIMPLES (1:1 com Business Service)
  // ============================================

  loadJogos(filters?: { status?: JogoStatus; search?: string }): Observable<Jogo[]> {
    return this.jogoService.loadJogos(filters);
  }

  getJogo(id: number): Observable<Jogo> {
    return this.jogoService.getJogo(id);
  }

  createJogo(data: { nome: string; descricao?: string; status?: JogoStatus }): Observable<Jogo> {
    return this.jogoService.createJogo(data);
  }

  updateJogo(id: number, data: Partial<Jogo>): Observable<Jogo> {
    return this.jogoService.updateJogo(id, data);
  }

  deleteJogo(id: number): Observable<void> {
    return this.jogoService.deleteJogo(id);
  }

  // Participantes
  loadParticipantes(jogoId: number): Observable<Participante[]> {
    return this.participanteService.loadParticipantes(jogoId);
  }

  aprovarParticipante(jogoId: number, participanteId: number): Observable<Participante> {
    return this.participanteService.aprovarParticipante(jogoId, participanteId);
  }

  rejeitarParticipante(jogoId: number, participanteId: number): Observable<Participante> {
    return this.participanteService.rejeitarParticipante(jogoId, participanteId);
  }

  removerParticipante(jogoId: number, participanteId: number): Observable<void> {
    return this.participanteService.removerParticipante(jogoId, participanteId);
  }

  // ============================================
  // COORDENAÇÃO (combina múltiplos services)
  // ============================================

  /**
   * Carrega jogo com participantes e fichas em paralelo
   * Exemplo de COORDENAÇÃO entre múltiplos services
   */
  loadJogoComplete(jogoId: number): Observable<{
    jogo: Jogo;
    participantes: Participante[];
    fichas: any[];
  }> {
    return forkJoin({
      jogo: this.jogoService.getJogo(jogoId),
      participantes: this.participanteService.loadParticipantes(jogoId),
      fichas: this.fichaService.loadFichas({ jogoId })
    });
  }

  /**
   * Computed de participantes aprovados
   */
  getParticipantesAprovados(jogoId: number) {
    return computed(() =>
      this.participanteService.getParticipantesByStatus(jogoId, 'APROVADO')
    );
  }

  /**
   * Computed de participantes pendentes
   */
  getParticipantesPendentes(jogoId: number) {
    return computed(() =>
      this.participanteService.getParticipantesByStatus(jogoId, 'PENDENTE')
    );
  }
}
