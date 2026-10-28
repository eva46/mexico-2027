// 驗證 public/data/ 下的 JSON 資料，任何錯誤即 exit(1)。只使用 Node 原生模組。
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'data');

const TRIP_START = [2027, 5, 20];
const TRIP_DAYS = 9;
const PACKING_LEVELS = ['critical', 'recommended', 'other'];

const errors = [];

function error(file, path, message) {
  errors.push(`[${file}] ${path}：${message}`);
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

/** 合法的 YYYY-MM-DD，且為實際存在的日期（例如排除 2027-02-30）。 */
function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function formatDate(y, m, d) {
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toISOString().slice(0, 10);
}

function checkString(file, path, value, { required = false } = {}) {
  if (typeof value !== 'string') {
    error(file, path, `必須是字串，目前為 ${JSON.stringify(value)}`);
  } else if (required && value.trim() === '') {
    error(file, path, '不可為空字串');
  }
}

function checkAllowedKeys(file, path, obj, allowed) {
  for (const key of Object.keys(obj)) {
    if (!allowed.includes(key)) {
      error(file, path, `不允許的欄位 "${key}"（只能有 ${allowed.join('、')}）`);
    }
  }
}

function loadJson(file) {
  let text;
  try {
    text = readFileSync(join(DATA_DIR, file), 'utf8');
  } catch (e) {
    error(file, '檔案', `無法讀取（${e.message}）`);
    return undefined;
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    error(file, 'JSON', `格式錯誤，無法解析（${e.message}）`);
    return undefined;
  }
}

function validateItinerary(data) {
  const file = 'itinerary.json';
  if (!isObject(data)) {
    error(file, '根節點', '必須是物件');
    return;
  }
  const expectedStart = formatDate(...TRIP_START);
  if (data.startDate !== expectedStart) {
    error(file, 'startDate', `必須是 "${expectedStart}"，目前為 ${JSON.stringify(data.startDate)}`);
  }
  if (!Array.isArray(data.days)) {
    error(file, 'days', '必須是陣列');
    return;
  }
  if (data.days.length !== TRIP_DAYS) {
    error(file, 'days', `必須剛好 ${TRIP_DAYS} 天，目前有 ${data.days.length} 天`);
  }

  data.days.forEach((day, i) => {
    const path = `days[${i}]`;
    if (!isObject(day)) {
      error(file, path, '必須是物件');
      return;
    }
    const expectedDay = i + 1;
    if (day.day !== expectedDay) {
      error(file, `${path}.day`, `必須是 ${expectedDay}（1～${TRIP_DAYS} 連續），目前為 ${JSON.stringify(day.day)}`);
    }
    const expectedDate = formatDate(TRIP_START[0], TRIP_START[1], TRIP_START[2] + i);
    if (day.date !== expectedDate) {
      error(file, `${path}.date`, `必須是 "${expectedDate}"，目前為 ${JSON.stringify(day.date)}`);
    }
    checkString(file, `${path}.title`, day.title, { required: true });
    checkString(file, `${path}.city`, day.city);
    checkString(file, `${path}.stay`, day.stay);

    if (!Array.isArray(day.items)) {
      error(file, `${path}.items`, '必須是陣列');
      return;
    }
    day.items.forEach((item, j) => {
      const itemPath = `${path}.items[${j}]`;
      if (!isObject(item)) {
        error(file, itemPath, '必須是物件');
        return;
      }
      checkString(file, `${itemPath}.title`, item.title, { required: true });
      for (const key of ['time', 'location', 'note', 'mapUrl']) {
        checkString(file, `${itemPath}.${key}`, item[key]);
      }
      if (typeof item.mapUrl === 'string' && item.mapUrl !== '' && !/^https:\/\//.test(item.mapUrl)) {
        error(file, `${itemPath}.mapUrl`, '必須是空字串或以 https:// 開頭的網址');
      }
    });
  });
}

function validatePacking(data) {
  const file = 'packing.json';
  if (!isObject(data)) {
    error(file, '根節點', '必須是物件');
    return;
  }
  if (!Array.isArray(data.categories)) {
    error(file, 'categories', '必須是陣列');
    return;
  }

  const seenIds = new Map();
  data.categories.forEach((category, i) => {
    const path = `categories[${i}]`;
    if (!isObject(category)) {
      error(file, path, '必須是物件');
      return;
    }
    if (!PACKING_LEVELS.includes(category.level)) {
      error(file, `${path}.level`, `必須是 ${PACKING_LEVELS.join(' / ')}，目前為 ${JSON.stringify(category.level)}`);
    }
    checkString(file, `${path}.label`, category.label, { required: true });

    if (!Array.isArray(category.items)) {
      error(file, `${path}.items`, '必須是陣列');
      return;
    }
    category.items.forEach((item, j) => {
      const itemPath = `${path}.items[${j}]`;
      if (!isObject(item)) {
        error(file, itemPath, '必須是物件');
        return;
      }
      checkString(file, `${itemPath}.id`, item.id, { required: true });
      if (typeof item.id === 'string' && item.id !== '') {
        if (seenIds.has(item.id)) {
          error(file, `${itemPath}.id`, `"${item.id}" 重複（已出現在 ${seenIds.get(item.id)}）`);
        } else {
          seenIds.set(item.id, itemPath);
        }
      }
      checkString(file, `${itemPath}.name`, item.name, { required: true });
      checkString(file, `${itemPath}.note`, item.note);
      if (item.deadline !== '' && !isValidDate(item.deadline)) {
        error(file, `${itemPath}.deadline`, `必須是空字串或合法的 YYYY-MM-DD，目前為 ${JSON.stringify(item.deadline)}`);
      }
    });
  });
}

function validatePayments(data) {
  const file = 'payments.json';
  if (!isObject(data)) {
    error(file, '根節點', '必須是物件');
    return;
  }
  checkAllowedKeys(file, '根節點', data, ['due', 'members']);
  if (!isPositiveInteger(data.due)) {
    error(file, 'due', `必須是正整數，目前為 ${JSON.stringify(data.due)}`);
  }
  if (!Array.isArray(data.members)) {
    error(file, 'members', '必須是陣列');
    return;
  }

  const seenNicknames = new Map();
  data.members.forEach((member, i) => {
    const path = `members[${i}]`;
    if (!isObject(member)) {
      error(file, path, '必須是物件');
      return;
    }
    checkAllowedKeys(file, path, member, ['nickname', 'payments']);
    checkString(file, `${path}.nickname`, member.nickname, { required: true });
    if (typeof member.nickname === 'string' && member.nickname.trim() !== '') {
      const key = member.nickname.trim();
      if (seenNicknames.has(key)) {
        error(file, `${path}.nickname`, `"${key}" 重複（已出現在 ${seenNicknames.get(key)}）`);
      } else {
        seenNicknames.set(key, path);
      }
    }

    if (!Array.isArray(member.payments)) {
      error(file, `${path}.payments`, '必須是陣列');
      return;
    }
    member.payments.forEach((payment, j) => {
      const payPath = `${path}.payments[${j}]`;
      if (!isObject(payment)) {
        error(file, payPath, '必須是物件');
        return;
      }
      checkAllowedKeys(file, payPath, payment, ['date', 'amount']);
      if (!isValidDate(payment.date)) {
        error(file, `${payPath}.date`, `必須是合法的 YYYY-MM-DD，目前為 ${JSON.stringify(payment.date)}`);
      }
      if (!isPositiveInteger(payment.amount)) {
        error(file, `${payPath}.amount`, `必須是正整數，目前為 ${JSON.stringify(payment.amount)}`);
      }
    });
  });
}

const itinerary = loadJson('itinerary.json');
if (itinerary !== undefined) validateItinerary(itinerary);

const packing = loadJson('packing.json');
if (packing !== undefined) validatePacking(packing);

const payments = loadJson('payments.json');
if (payments !== undefined) validatePayments(payments);

if (errors.length > 0) {
  console.error(`資料驗證失敗，共 ${errors.length} 個錯誤：\n`);
  for (const message of errors) {
    console.error(`  ✗ ${message}`);
  }
  process.exit(1);
}

console.log('✓ 資料驗證通過：itinerary.json、packing.json、payments.json');
