import { Service, signal } from '@angular/core';

const KEY_PREFIX = 'mexico-2027:packing:';

/**
 * 攜帶物品的勾選狀態，存在 localStorage（只影響本人裝置）。
 * 每個物品一個 key：`mexico-2027:packing:<id>`。
 * 無痕模式、停用儲存空間等情況下讀寫會丟例外，一律吞掉，勾選仍可在本次瀏覽中運作。
 */
@Service()
export class PackingChecks {
  private readonly checked = signal<ReadonlySet<string>>(readAll());

  isChecked(id: string): boolean {
    return this.checked().has(id);
  }

  /** 傳入的 id 中已勾選幾項 */
  countChecked(ids: readonly string[]): number {
    const checked = this.checked();
    return ids.filter((id) => checked.has(id)).length;
  }

  setChecked(id: string, value: boolean): void {
    this.checked.update((current) => {
      const next = new Set(current);
      if (value) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
    try {
      if (value) {
        localStorage.setItem(KEY_PREFIX + id, '1');
      } else {
        localStorage.removeItem(KEY_PREFIX + id);
      }
    } catch {
      // 無法寫入時只保留記憶體中的狀態
    }
  }
}

function readAll(): ReadonlySet<string> {
  const ids = new Set<string>();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(KEY_PREFIX) && localStorage.getItem(key) === '1') {
        ids.add(key.slice(KEY_PREFIX.length));
      }
    }
  } catch {
    // 無法讀取時視為全部未勾選
  }
  return ids;
}
