import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

/** Shared list footer: Arabic pager + page size (used by CRUD/list screens). */
@Component({
  selector: 'app-list-pagination-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-pagination-bar.component.html',
  styleUrl: './list-pagination-bar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListPaginationBarComponent {
  readonly totalCount = input.required<number>();
  readonly pageNumber = input(1);
  readonly pageSize = input(10);
  readonly pageSizeOptions = input<number[]>([5, 10, 20, 50]);

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  readonly totalPages = computed(() => {
    const total = this.totalCount() ?? 0;
    const size = this.pageSize() ?? 10;
    if (size <= 0) return 1;
    return Math.max(1, Math.ceil(total / size) || 1);
  });

  readonly pageNumbers = computed(() => {
    const len = this.totalPages();
    return Array.from({ length: len }, (_, i) => i + 1);
  });

  readonly pageStart = computed(() => {
    const total = this.totalCount() ?? 0;
    if (total === 0) return 0;
    const page = this.pageNumber() ?? 1;
    const size = this.pageSize() ?? 10;
    return (page - 1) * size + 1;
  });

  readonly pageEnd = computed(() => {
    const total = this.totalCount() ?? 0;
    const page = this.pageNumber() ?? 1;
    const size = this.pageSize() ?? 10;
    return Math.min(page * size, total);
  });

  /** Index into `pageSizeOptions` for the range input (discrete steps). */
  readonly pageSizeOptionIndex = computed(() => {
    const opts = this.pageSizeOptions();
    if (opts.length === 0) return 0;
    const size = this.pageSize() ?? opts[0] ?? 10;
    const exact = opts.indexOf(size);
    if (exact >= 0) return exact;
    let best = 0;
    let bestDiff = Infinity;
    opts.forEach((n, i) => {
      const d = Math.abs(n - size);
      if (d < bestDiff) {
        bestDiff = d;
        best = i;
      }
    });
    return best;
  });

  readonly pageSizeMaxIndex = computed(() =>
    Math.max(0, this.pageSizeOptions().length - 1)
  );

  /** While dragging, keeps the thumb in sync (parent `pageSize` updates only on `change`). */
  private readonly pageSizeRangeDraftIndex = signal<number | null>(null);

  readonly pageSizeRangeIndex = computed(() => {
    const draft = this.pageSizeRangeDraftIndex();
    return draft !== null ? draft : this.pageSizeOptionIndex();
  });

  readonly pageSizeRangeLabel = computed(() => {
    const opts = this.pageSizeOptions();
    const i = this.pageSizeRangeIndex();
    const n = opts[i];
    return Number.isFinite(n) ? n : this.pageSize();
  });

  onPageSizeRangeInput(ev: Event): void {
    const idx = Number((ev.target as HTMLInputElement).value);
    const max = this.pageSizeMaxIndex();
    this.pageSizeRangeDraftIndex.set(
      Number.isFinite(idx) && idx >= 0 && idx <= max ? idx : null
    );
  }

  emitPageSizeFromRange(ev: Event): void {
    this.pageSizeRangeDraftIndex.set(null);
    const idx = Number((ev.target as HTMLInputElement).value);
    const opts = this.pageSizeOptions();
    const n = opts[idx];
    this.pageSizeChange.emit(Number.isFinite(n) ? n : 0);
  }
}
