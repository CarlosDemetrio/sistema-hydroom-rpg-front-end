# 📐 Padrão para Geração de Componentes de Configuração

**Versões**: Angular 21 + PrimeNG 21  
**Tema**: PrimeNG Custom Preset (Aura)

---

## 🎨 Regras de Estilização (CRÍTICO)

### ❌ NUNCA Use

- ❌ `style="..."` inline em elementos HTML
- ❌ Cores hexadecimais ou classes Tailwind arbitrárias (`bg-blue-600`)
- ❌ `class="w-full"` em inputs (PrimeNG gerencia)
- ❌ `[breakpoints]` e `[style]` juntos no dialog
- ❌ `styleClass="..."` customizado

### ✅ SEMPRE Use

- ✅ Tokens semânticos: `surface-card`, `surface-border`, `surface-ground`, `text-color`, `text-color-secondary`, `text-primary`
- ✅ Classes PrimeFlex: `flex`, `grid`, `gap-2`, `gap-3`, `gap-4`, `p-3`, `mb-4`, `mt-4`
- ✅ Grid responsivo: `col-12`, `md:col-6`, `lg:col-4`
- ✅ Flex responsivo: `flex-column`, `md:flex-row`
- ✅ Alinhamento: `align-items-center`, `justify-content-between`

---

## 🏗️ Estrutura do Componente TypeScript

```typescript
import { Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
// Imports de PrimeNG modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
// ... outros módulos necessários

import { BaseConfigComponent } from '../../../../../shared/components/base-config/base-config.component';
import { [Config] } from '../../../../../core/models';
import { [ConfigService] } from '../../../../../core/services/business/config';
import { uniqueNameValidator, uppercaseValidator } from '../../../../../shared/validators/config-validators';

@Component({
  selector: 'app-[nome]-config',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    // PrimeNG modules
    ButtonModule,
    CardModule,
    // ... lista completa
  ],
  providers: [ConfirmationService],
  templateUrl: './[nome]-config.component.html'
})
export class [Nome]ConfigComponent extends BaseConfigComponent<
  [Config],
  [ConfigService]
> {
  protected service = inject([ConfigService]);
  private confirmationService = inject(ConfirmationService);

  protected getEntityName(): string {
    return '[Nome Singular]';
  }

  protected getEntityNamePlural(): string {
    return '[Nome Plural]';
  }

  protected buildForm(): FormGroup {
    return this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      // ... outros campos
      ordemExibicao: [1, [Validators.required, Validators.min(1)]],
      ativo: [true]
    });
  }

  override confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir este ${this.getEntityName()}?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => this.delete(id)
    });
  }

  override openDialog(item?: [Config]): void {
    super.openDialog(item);
    
    // Adicionar validadores dinâmicos se necessário
    const nomeControl = this.form.get('nome');
    if (nomeControl) {
      const currentId = item?.id || null;
      nomeControl.setValidators([
        Validators.required,
        Validators.minLength(3),
        uniqueNameValidator(this.items(), currentId)
      ]);
      nomeControl.updateValueAndValidity();
    }
  }
}
```

---

## 📄 Estrutura do Template HTML

```html
<p-card>

  <!-- Indicador de Jogo Atual -->
  @if (hasGame()) {
    <div class="flex align-items-center gap-2 mb-3 p-3 surface-100 border-round">
      <i class="pi pi-[icone] text-primary"></i>
      <span class="font-semibold text-primary">
        Configurando: {{ currentGameName() }}
      </span>
    </div>
  }

  <!-- Header com título e botão -->
  <div class="flex flex-column md:flex-row align-items-start md:align-items-center justify-content-between gap-3 mb-4">
    <div>
      <h2 class="text-2xl font-bold m-0 mb-2">
        <i class="pi pi-[icone] text-primary mr-2"></i>
        [Título]
      </h2>
      <p class="text-color-secondary m-0">
        [Descrição do que faz]
      </p>
    </div>
    <p-button
      icon="pi pi-plus"
      label="Novo [Nome]"
      (onClick)="openDialog()"
      [disabled]="!hasGame()"
    ></p-button>
  </div>

  <!-- Tabela -->
  <p-table
    [value]="items()"
    [paginator]="true"
    [rows]="10"
    [rowsPerPageOptions]="[5, 10, 20]"
    [rowHover]="true"
  >
    <ng-template #header>
      <tr>
        <th>[Coluna 1]</th>
        <th>[Coluna 2]</th>
        <th>Status</th>
        <th class="text-center">Ações</th>
      </tr>
    </ng-template>

    <ng-template #body let-item>
      <tr>
        <td>{{ item.campo1 }}</td>
        <td>{{ item.campo2 }}</td>
        <td>
          @if (item.ativo) {
            <p-tag severity="success" value="Ativo"></p-tag>
          } @else {
            <p-tag severity="danger" value="Inativo"></p-tag>
          }
        </td>
        <td class="text-center">
          <div class="flex gap-2 justify-content-center">
            <p-button
              icon="pi pi-pencil"
              [rounded]="true"
              [text]="true"
              [severity]="'secondary'"
              (onClick)="openDialog(item)"
              pTooltip="Editar"
            ></p-button>
            <p-button
              icon="pi pi-trash"
              [rounded]="true"
              [text]="true"
              [severity]="'danger'"
              (onClick)="confirmDelete(item.id!)"
              pTooltip="Excluir"
            ></p-button>
          </div>
        </td>
      </tr>
    </ng-template>

    <ng-template #emptymessage>
      <tr>
        <td colspan="[N]" class="text-center p-5">
          <div class="flex flex-column align-items-center gap-3">
            <i class="pi pi-inbox text-6xl text-400"></i>
            <p class="text-xl text-600 m-0">Nenhum [nome] cadastrado</p>
            @if (hasGame()) {
              <p-button
                label="Criar Primeiro [Nome]"
                icon="pi pi-plus"
                (onClick)="openDialog()"
              ></p-button>
            }
          </div>
        </td>
      </tr>
    </ng-template>
  </p-table>

</p-card>

<!-- Dialog de Criação/Edição -->
<p-dialog
  [(visible)]="dialogVisible"
  [header]="editMode() ? 'Editar [Nome]' : 'Novo [Nome]'"
  [modal]="true"
>
  <form [formGroup]="form" (ngSubmit)="save()">

    <div class="flex flex-column gap-3">

      <!-- Campo 1 -->
      <div class="flex flex-column gap-2">
        <label for="campo1" class="font-semibold">
          [Label] <span class="text-red-500">*</span>
        </label>
        <input
          pInputText
          id="campo1"
          formControlName="campo1"
          placeholder="Ex: ..."
        />
        @if (form.get('campo1')?.invalid && form.get('campo1')?.touched) {
          <small class="text-red-500">
            @if (form.get('campo1')?.errors?.['required']) {
              Campo obrigatório
            }
          </small>
        }
      </div>

      <!-- Grid de 2 colunas - responsivo -->
      <div class="grid">
        <div class="col-12 md:col-6">
          <div class="flex flex-column gap-2">
            <label for="campo2" class="font-semibold">[Label]</label>
            <input
              pInputText
              id="campo2"
              formControlName="campo2"
            />
          </div>
        </div>

        <div class="col-12 md:col-6">
          <div class="flex flex-column gap-2">
            <label for="ordemExibicao" class="font-semibold">
              Ordem <span class="text-red-500">*</span>
            </label>
            <p-inputnumber
              inputId="ordemExibicao"
              formControlName="ordemExibicao"
              [min]="1"
              [showButtons]="true"
            ></p-inputnumber>
          </div>
        </div>
      </div>

      <!-- Ativo -->
      <div class="flex align-items-center gap-2">
        <p-checkbox
          inputId="ativo"
          formControlName="ativo"
          [binary]="true"
        ></p-checkbox>
        <label for="ativo" class="font-semibold cursor-pointer">
          Ativo
        </label>
      </div>

    </div>

    <!-- Botões do formulário -->
    <div class="flex justify-content-end gap-2 mt-4">
      <p-button
        label="Cancelar"
        [severity]="'secondary'"
        (onClick)="closeDialog()"
        [outlined]="true"
        type="button"
      ></p-button>
      <p-button
        label="Salvar"
        icon="pi pi-check"
        type="submit"
        [disabled]="form.invalid"
      ></p-button>
    </div>

  </form>
</p-dialog>

<p-confirmDialog></p-confirmDialog>
```

---

## 📋 Checklist de Validação

### Template HTML
- [ ] ❌ Sem `style="..."` inline
- [ ] ❌ Sem classes Tailwind de cores (`bg-blue-600`)
- [ ] ❌ Sem `class="w-full"` em inputs
- [ ] ✅ Usa tokens semânticos (`surface-card`, `text-primary`)
- [ ] ✅ Grid responsivo (`col-12 md:col-6`)
- [ ] ✅ Flex responsivo (`flex-column md:flex-row`)
- [ ] ✅ Componentes PrimeNG corretos
- [ ] ✅ Nomes de tags corretos (`p-inputnumber` não `p-inputNumber`)

### TypeScript
- [ ] ✅ Estende `BaseConfigComponent`
- [ ] ✅ Usa `inject()` ao invés de constructor
- [ ] ✅ Implementa `buildForm()`, `getEntityName()`, `getEntityNamePlural()`
- [ ] ✅ Sobrescreve `confirmDelete()` e `openDialog()` se necessário
- [ ] ✅ Importa apenas módulos usados
- [ ] ✅ `standalone: true`
- [ ] ✅ `providers: [ConfirmationService]`

### Funcionalidades
- [ ] ✅ CRUD completo (listar, criar, editar, excluir)
- [ ] ✅ Validações de formulário
- [ ] ✅ Indicador de jogo selecionado
- [ ] ✅ Empty state quando sem dados
- [ ] ✅ Confirmação de exclusão
- [ ] ✅ Feedback visual de erros
- [ ] ✅ Mobile-first responsivo

---

## 🎯 Exemplo Completo: AtributosConfigComponent

Referência implementada: 
- `src/app/features/mestre/pages/config/configs/atributos-config.component.ts`
- `src/app/features/mestre/pages/config/configs/atributos-config.component.html`

Use como modelo base para todas as outras configurações!

---

**Última atualização**: 2026-02-05
