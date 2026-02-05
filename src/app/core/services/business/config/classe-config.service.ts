import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ClassePersonagem } from '../../../models';
import { BaseConfigService } from './base-config.service';

/**
 * Business Service para Classes
 * Gerencia configurações de classes de personagem
 */
@Injectable({ providedIn: 'root' })
export class ClasseConfigService extends BaseConfigService<ClassePersonagem> {

  protected getEndpointName(): string {
    return 'Classes';
  }

  protected getApiListMethod(): (jogoId: number) => Observable<ClassePersonagem[]> {
    return this.configApi.listClasses.bind(this.configApi);
  }

  protected getApiCreateMethod(): (data: any) => Observable<ClassePersonagem> {
    return this.configApi.createClasse.bind(this.configApi);
  }

  protected getApiUpdateMethod(): (id: number, data: any) => Observable<ClassePersonagem> {
    return this.configApi.updateClasse.bind(this.configApi);
  }

  protected getApiDeleteMethod(): (id: number) => Observable<void> {
    return this.configApi.deleteClasse.bind(this.configApi);
  }
}
