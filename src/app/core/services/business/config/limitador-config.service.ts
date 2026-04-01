import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LimitadorConfig } from '@core/models/config.models';
import { BaseConfigService } from './base-config.service';

/**
 * LimitadorConfig does not have a backend endpoint.
 * This service is a stub kept for backward compatibility with existing components.
 */
@Injectable({ providedIn: 'root' })
export class LimitadorConfigService extends BaseConfigService<LimitadorConfig> {

  protected getEndpointName(): string {
    return 'Limitadores';
  }

  protected getApiListMethod(): (jogoId: number) => Observable<LimitadorConfig[]> {
    return (_jogoId: number) => of([]);
  }

  protected getApiCreateMethod(): (data: any) => Observable<LimitadorConfig> {
    return (_data: any) => of({} as LimitadorConfig);
  }

  protected getApiUpdateMethod(): (id: number, data: any) => Observable<LimitadorConfig> {
    return (_id: number, _data: any) => of({} as LimitadorConfig);
  }

  protected getApiDeleteMethod(): (id: number) => Observable<void> {
    return (_id: number) => of(undefined as void);
  }
}
