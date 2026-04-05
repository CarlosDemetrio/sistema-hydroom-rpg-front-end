/**
 * COMPONENTE DESTRUIDO — substituido por FichaWizardComponent (Spec 006 T6)
 *
 * Este arquivo existe apenas para manter compatibilidade com imports existentes
 * durante a transicao. O export aponta para o FichaWizardComponent.
 *
 * Rotas atualizadas em app.routes.ts:
 *   /jogador/fichas/nova       → FichaWizardComponent
 *   /jogador/fichas/criar-npc  → FichaWizardComponent (data: { npc: true })
 *   /jogador/fichas/:id/edit   → FichaWizardComponent (com ?fichaId=:id)
 */
export { FichaWizardComponent as FichaFormComponent } from './ficha-wizard.component';
