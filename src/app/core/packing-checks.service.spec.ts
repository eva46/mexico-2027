import { TestBed } from '@angular/core/testing';
import { PackingChecks } from './packing-checks.service';

describe('PackingChecks', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('啟動時讀取已存的勾選狀態', () => {
    localStorage.setItem('mexico-2027:packing:passport', '1');
    localStorage.setItem('unrelated', '1');
    const checks = TestBed.inject(PackingChecks);

    expect(checks.isChecked('passport')).toBe(true);
    expect(checks.isChecked('visa')).toBe(false);
    expect(checks.countChecked(['passport', 'visa'])).toBe(1);
  });

  it('勾選與取消會寫回 localStorage', () => {
    const checks = TestBed.inject(PackingChecks);

    checks.setChecked('mask', true);
    expect(checks.isChecked('mask')).toBe(true);
    expect(localStorage.getItem('mexico-2027:packing:mask')).toBe('1');

    checks.setChecked('mask', false);
    expect(checks.isChecked('mask')).toBe(false);
    expect(localStorage.getItem('mexico-2027:packing:mask')).toBeNull();
  });

  it('localStorage 無法使用時不丟例外，狀態仍保留在記憶體', () => {
    localStorage.setItem('mexico-2027:packing:mask', '1');
    vi.spyOn(Storage.prototype, 'key').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const checks = TestBed.inject(PackingChecks);

    expect(() => checks.setChecked('fins', true)).not.toThrow();
    expect(checks.isChecked('fins')).toBe(true);
  });
});
