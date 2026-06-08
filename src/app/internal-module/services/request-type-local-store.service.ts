import { Injectable } from '@angular/core';
import {
  AttachmentTypeDto,
  IntegrationTypeDto,
  PageResult,
  RequestTypeDto,
  SearchParameters,
  WorkFlowDefinitionDto
} from '../../core/models';

const INTEGRATION_KEY = 'petraInternalIntegrationTypes';
const ATTACHMENT_KEY = 'petraInternalAttachmentTypes';
const REQUEST_TYPES_KEY = 'petraInternalRequestTypes';
const WORKFLOWS_KEY = 'petraInternalWorkflows';

function nowIso(): string {
  return new Date().toISOString();
}

function defaultIntegrations(): IntegrationTypeDto[] {
  return [
    { id: 1, name: 'نظام الموارد', code: 'HR', active: 1, createdDate: nowIso() },
    { id: 2, name: 'المالية', code: 'FIN', active: 1, createdDate: nowIso() }
  ];
}

function defaultAttachments(): AttachmentTypeDto[] {
  return [
    { id: 1, name: 'هوية', code: 'ID', active: 1, createdDate: nowIso() },
    { id: 2, name: 'جواز سفر', code: 'PASSPORT', active: 1, createdDate: nowIso() }
  ];
}

@Injectable({ providedIn: 'root' })
export class RequestTypeLocalStoreService {
  // —— Integration types ——
  searchIntegrationTypes(params: SearchParameters): PageResult<IntegrationTypeDto> {
    let list = this.ensureIntegrations();
    const kw = (params.keyword ?? '').trim().toLowerCase();
    if (kw) {
      list = list.filter(
        (x) => (x.name ?? '').toLowerCase().includes(kw) || (x.code ?? '').toLowerCase().includes(kw)
      );
    }
    return this.paginate(list, params);
  }

  getAllIntegrationTypes(): IntegrationTypeDto[] {
    return this.ensureIntegrations().filter((x) => x.active === 1);
  }

  listAllIntegrations(): IntegrationTypeDto[] {
    return [...this.ensureIntegrations()];
  }

  listAllAttachments(): AttachmentTypeDto[] {
    return [...this.ensureAttachments()];
  }

  listAllRequestTypes(): RequestTypeDto[] {
    return this.read<RequestTypeDto>(REQUEST_TYPES_KEY).map((r) => ({
      ...r,
      requestDetails: [...(r.requestDetails ?? [])],
      requestTypeAttachments: [...(r.requestTypeAttachments ?? [])]
    }));
  }

  getIntegrationTypeById(id: number): IntegrationTypeDto | undefined {
    return this.ensureIntegrations().find((x) => x.id === id);
  }

  saveIntegrationType(dto: IntegrationTypeDto): number {
    const list = this.ensureIntegrations();
    const id = dto.id && dto.id > 0 ? dto.id : this.nextId(list);
    const row: IntegrationTypeDto = { ...dto, id, createdDate: dto.createdDate ?? nowIso() };
    const i = list.findIndex((x) => x.id === id);
    if (i >= 0) list[i] = row;
    else list.push(row);
    this.write(INTEGRATION_KEY, list);
    return id;
  }

  // —— Attachment types ——
  searchAttachmentTypes(params: SearchParameters): PageResult<AttachmentTypeDto> {
    let list = this.ensureAttachments();
    const kw = (params.keyword ?? '').trim().toLowerCase();
    if (kw) {
      list = list.filter(
        (x) => (x.name ?? '').toLowerCase().includes(kw) || (x.code ?? '').toLowerCase().includes(kw)
      );
    }
    return this.paginate(list, params);
  }

  getAllAttachmentTypes(): AttachmentTypeDto[] {
    return this.ensureAttachments().filter((x) => x.active === 1);
  }

  getAttachmentTypeById(id: number): AttachmentTypeDto | undefined {
    return this.ensureAttachments().find((x) => x.id === id);
  }

  saveAttachmentType(dto: AttachmentTypeDto): number {
    const list = this.ensureAttachments();
    const id = dto.id && dto.id > 0 ? dto.id : this.nextId(list);
    const row: AttachmentTypeDto = { ...dto, id, createdDate: dto.createdDate ?? nowIso() };
    const i = list.findIndex((x) => x.id === id);
    if (i >= 0) list[i] = row;
    else list.push(row);
    this.write(ATTACHMENT_KEY, list);
    return id;
  }

  // —— Request types ——
  searchRequestTypes(params: SearchParameters, active?: number): PageResult<RequestTypeDto> {
    let list = this.read<RequestTypeDto>(REQUEST_TYPES_KEY);
    const kw = (params.keyword ?? '').trim().toLowerCase();
    if (kw) {
      list = list.filter(
        (r) =>
          (r.title ?? '').toLowerCase().includes(kw) ||
          (r.code ?? '').toLowerCase().includes(kw) ||
          (r.isoCode ?? '').toLowerCase().includes(kw)
      );
    }
    if (active != null) {
      list = list.filter((r) => r.active === active);
    }
    return this.paginate(list, params);
  }

  getRequestTypeById(id: number): RequestTypeDto | undefined {
    const row = this.read<RequestTypeDto>(REQUEST_TYPES_KEY).find((x) => x.id === id);
    return row ? { ...row, requestDetails: [...(row.requestDetails ?? [])], requestTypeAttachments: [...(row.requestTypeAttachments ?? [])] } : undefined;
  }

  saveRequestType(dto: RequestTypeDto): number {
    const list = this.read<RequestTypeDto>(REQUEST_TYPES_KEY);
    const id = dto.id && dto.id > 0 ? dto.id : this.nextId(list);
    const wf = this.getWorkflowByRequestTypeId(id);
    const row: RequestTypeDto = {
      ...dto,
      id,
      createdDate: dto.createdDate ?? nowIso(),
      requestDetails: (dto.requestDetails ?? []).map((d) => ({ ...d, requestTypeId: id })),
      requestTypeAttachments: (dto.requestTypeAttachments ?? []).map((a) => ({ ...a, requestTypeId: id })),
      workFlowDefinitionId: wf?.id ?? dto.workFlowDefinitionId ?? null,
      workFlowNameAr: wf?.nameAr ?? dto.workFlowNameAr,
      workFlowNameOt: wf?.nameOt ?? dto.workFlowNameOt
    };
    const i = list.findIndex((x) => x.id === id);
    if (i >= 0) list[i] = row;
    else list.push(row);
    this.write(REQUEST_TYPES_KEY, list);
    return id;
  }

  deleteRequestType(id: number): void {
    const list = this.read<RequestTypeDto>(REQUEST_TYPES_KEY).filter((x) => x.id !== id);
    this.write(REQUEST_TYPES_KEY, list);
    const wfs = this.read<WorkFlowDefinitionDto>(WORKFLOWS_KEY).filter((w) => w.requestTypeId !== id);
    this.write(WORKFLOWS_KEY, wfs);
  }

  linkWorkflowToRequestType(requestTypeId: number, workflowId: number, nameAr: string, nameOt: string): void {
    const list = this.read<RequestTypeDto>(REQUEST_TYPES_KEY);
    const i = list.findIndex((x) => x.id === requestTypeId);
    if (i < 0) return;
    list[i] = {
      ...list[i],
      workFlowDefinitionId: workflowId,
      workFlowNameAr: nameAr,
      workFlowNameOt: nameOt
    };
    this.write(REQUEST_TYPES_KEY, list);
  }

  // —— Workflows ——
  getWorkflowById(id: number): WorkFlowDefinitionDto | undefined {
    const row = this.read<WorkFlowDefinitionDto>(WORKFLOWS_KEY).find((x) => x.id === id);
    return row ? { ...row, steps: [...(row.steps ?? [])] } : undefined;
  }

  getWorkflowByRequestTypeId(requestTypeId: number): WorkFlowDefinitionDto | undefined {
    return this.read<WorkFlowDefinitionDto>(WORKFLOWS_KEY).find((x) => x.requestTypeId === requestTypeId);
  }

  saveWorkflow(dto: WorkFlowDefinitionDto): number {
    const list = this.read<WorkFlowDefinitionDto>(WORKFLOWS_KEY);
    const existingForType = list.find((w) => w.requestTypeId === dto.requestTypeId && w.id !== dto.id);
    if (existingForType && (!dto.id || dto.id === 0)) {
      throw new Error('يوجد بالفعل سير عمل مرتبط بنوع الخدمة هذا.');
    }
    if (!(dto.steps?.length ?? 0)) {
      throw new Error('يجب إضافة خطوة واحدة على الأقل.');
    }
    const archived = (dto.steps ?? []).filter((s) => s.isArchivedStep);
    if (archived.length > 1) {
      throw new Error('يُسمح بخطوة أرشيف واحدة فقط.');
    }
    const id = dto.id && dto.id > 0 ? dto.id : this.nextId(list);
    const row: WorkFlowDefinitionDto = {
      ...dto,
      id,
      createdDate: dto.createdDate ?? nowIso(),
      steps: (dto.steps ?? []).map((s, i) => ({ ...s, order: i + 1 }))
    };
    const i = list.findIndex((x) => x.id === id);
    if (i >= 0) list[i] = row;
    else list.push(row);
    this.write(WORKFLOWS_KEY, list);
    this.linkWorkflowToRequestType(dto.requestTypeId, id, row.nameAr, row.nameOt);
    return id;
  }

  private ensureIntegrations(): IntegrationTypeDto[] {
    const list = this.read<IntegrationTypeDto>(INTEGRATION_KEY);
    if (list.length) return list;
    const seed = defaultIntegrations();
    this.write(INTEGRATION_KEY, seed);
    return seed;
  }

  private ensureAttachments(): AttachmentTypeDto[] {
    const list = this.read<AttachmentTypeDto>(ATTACHMENT_KEY);
    if (list.length) return list;
    const seed = defaultAttachments();
    this.write(ATTACHMENT_KEY, seed);
    return seed;
  }

  private paginate<T>(list: T[], params: SearchParameters): PageResult<T> {
    const count = list.length;
    const page = params.pagingParameters?.pageNumber ?? 1;
    const size = params.pagingParameters?.pageSize ?? 10;
    const start = Math.max(0, (page - 1) * size);
    return { collections: list.slice(start, start + size), count };
  }

  private nextId(list: { id: number }[]): number {
    const max = list.reduce((m, x) => Math.max(m, x.id ?? 0), 0);
    return max + 1;
  }

  private read<T>(key: string): T[] {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  private write<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }
}
