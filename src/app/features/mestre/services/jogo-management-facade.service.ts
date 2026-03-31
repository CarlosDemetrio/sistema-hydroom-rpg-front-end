import { Injectable, inject, computed } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { JogoBusinessService } from '../../../core/services/business/jogo-business.service';
import { ParticipanteBusinessService } from '../../../core/services/business/participante-business.service';
import { FichaBusinessService } from '../../../core/services/business/ficha-business.service';
import { JogoResumo, Jogo } from '../../../core/models/jogo.model';
import { Participante } from '../../../core/models/participante.model';
import { CreateJogoDto, UpdateJogoDto } from '../../../core/models/dtos/jogo.dto';
import { Ficha } from '../../../core/models/ficha.model';

/**
 * Jogo Management Facade Service
 *
 * Responsabilidade: COORDENAÇÃO entre Business Services.
 * Expõe API simplificada para Components.
 */
@Injectable({
  providedIn: 'root'
})
export class JogoManagementFacadeService {
  private jogoService = inject(JogoBusinessService);
  private participanteService = inject(ParticipanteBusinessService);
  private fichaService = inject(FichaBusinessService);

  // Exposed state
  jogos = this.jogoService.jogos;
  loading = this.jogoService.loading;
  error = this.jogoService.error;

  totalJogos = computed(() => this.jogoService.jogos().length);

  jogosAtivos = computed(() =>
    this.jogoService.jogos().filter((j: JogoResumo) => j.ativo === true)
  );

  // ============================================
  // DELEGAÇÃO
  // ============================================

  loadJogos(): Observable<JogoResumo[]> {
    return this.jogoService.loadJogos();
  }

  getJogo(id: number): Observable<Jogo> {
    return this.jogoService.getJogo(id);
  }

  createJogo(dto: CreateJogoDto): Observable<Jogo> {
    return this.jogoService.createJogo(dto);
  }

  updateJogo(id: number, dto: UpdateJogoDto): Observable<Jogo> {
    return this.jogoService.updateJogo(id, dto);
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

  banirParticipante(jogoId: number, participanteId: number): Observable<Participante> {
    return this.participanteService.banirParticipante(jogoId, participanteId);
  }

  // ============================================
  // COORDENAÇÃO
  // ============================================

  loadJogoComplete(jogoId: number): Observable<{
    jogo: Jogo;
    participantes: Participante[];
    fichas: Ficha[];
  }> {
    return forkJoin({
      jogo: this.jogoService.getJogo(jogoId),
      participantes: this.participanteService.loadParticipantes(jogoId),
      fichas: this.fichaService.loadFichas(jogoId)
    });
  }

  getParticipantesAprovados(jogoId: number) {
    return computed(() =>
      this.participanteService.getParticipantesByStatus(jogoId, 'APROVADO')
    );
  }

  getParticipantesPendentes(jogoId: number) {
    return computed(() =>
      this.participanteService.getParticipantesByStatus(jogoId, 'PENDENTE')
    );
  }
}
