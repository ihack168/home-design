import https from 'https';

const SANITY_PROJECT_ID = 'gq4nr57o';
const SANITY_DATASET = 'production';
const SANITY_TOKEN = process.env.SANITY_TOKEN;

// Google Sheet 工作表
const SHEET_NAME = 'home-design';

// 請確認 warningcasepost.ts 裡的 schema name。
// 如果你寫的是 name: 'warningcasepost'，這裡就改成 warningcasepost。
const SANITY_DOCUMENT_TYPE = 'warningCasePost';

const GOOGLE_SCRIPT_BASE_URL =
  'https://script.google.com/macros/s/AKfycbwFpZDhMveHhdOYdDkh02JpWk28jUCBqikyM-Urg_6Uw2jTH7d8ZluKxinKTWh5_20N/exec';

const GOOGLE_SCRIPT_URL =
  `${GOOGLE_SCRIPT_BASE_URL}?sheet=${encodeURIComponent(SHEET_NAME)}`;

const RANDOM_WARNING_CASE_URL =
  `${GOOGLE_SCRIPT_URL}&action=randomExternalArticle`;

const REQUEST_TIMEOUT = 15000;

// 現有 GAS 的 randomExternalArticle 是隨機抽取，且沒有先排除 AB=published。
// 因此最多重抽幾次，避免抽到已發布案例。
const MAX_FETCH_ATTEMPTS = 30;

function requestJson(url, label) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 GitHub-Actions-Warning-Case-AutoPost',
        },
        timeout: REQUEST_TIMEOUT,
      },
      (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          requestJson(res.headers.location, `${label} redirect`)
            .then(resolve)
            .catch(reject);
          return;
        }

        const chunks = [];

        res.on('data', (chunk) => chunks.push(chunk));

        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');

          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(
              new Error(`${label} HTTP ${res.statusCode}：${text}`)
            );
            return;
          }

          try {
            resolve(JSON.parse(text));
          } catch {
            reject(new Error(`${label} JSON 解析失敗：${text}`));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(
        new Error(
          `${label} 請求逾時，超過 ${REQUEST_TIMEOUT / 1000} 秒沒有回應`
        )
      );
    });

    req.on('error', reject);
  });
}

function postJsonToAppsScript(payload, label) {
  const data = JSON.stringify(payload);

  return new Promise((resolve, reject) => {
    const sendRequest = (url) => {
      const req = https.request(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(data, 'utf8'),
            'User-Agent': 'Mozilla/5.0 GitHub-Actions-Warning-Case-AutoPost',
          },
          timeout: REQUEST_TIMEOUT,
        },
        (res) => {
          if (
            res.statusCode >= 300 &&
            res.statusCode < 400 &&
            res.headers.location
          ) {
            sendRequest(res.headers.location);
            return;
          }

          const chunks = [];

          res.on('data', (chunk) => chunks.push(chunk));

          res.on('end', () => {
            const text = Buffer.concat(chunks).toString('utf8');

            if (res.statusCode < 200 || res.statusCode >= 300) {
              reject(
                new Error(`${label} HTTP ${res.statusCode}：${text}`)
              );
              return;
            }

            console.log(`📦 ${label} 回傳：${text}`);
            resolve(text);
          });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        reject(
          new Error(
            `${label} 請求逾時，超過 ${REQUEST_TIMEOUT / 1000} 秒沒有回應`
          )
        );
      });

      req.on('error', reject);
      req.write(Buffer.from(data, 'utf8'));
      req.end();
    };

    sendRequest(GOOGLE_SCRIPT_URL);
  });
}

function createSlug(title) {
  const cleanTitle = String(title || '')
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9]/g, '');

  const shortTitle = cleanTitle.substring(0, 20) || 'warning-case';
  const uniqueId = Math.floor(
    10000000 + Math.random() * 90000000
  ).toString();

  return `${encodeURIComponent(shortTitle)}-${uniqueId}`;
}

async function fetchUnpublishedWarningCase() {
  for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt++) {
    console.log(`🔎 尋找未發布踩雷案例，第 ${attempt} 次`);

    const result = await requestJson(
      RANDOM_WARNING_CASE_URL,
      'Apps Script'
    );

    if (!result || result.success === false || result.error) {
      throw new Error(
        `Apps Script 找不到案例：${result?.error || '未知錯誤'}`
      );
    }

    const title = String(result.warningCaseTitle || '').trim();
    const description = String(
      result.warningCaseDescription || ''
    ).trim();
    const status = String(
      result.warningCaseStatus || ''
    ).trim().toLowerCase();

    if (!title || !description) {
      console.log(`⏭️ 第 ${result.row} 列沒有完整的 Z／AA 欄，重新抽取`);
      continue;
    }

    if (status === 'published') {
      console.log(`⏭️ 第 ${result.row} 列 AB 已是 published，重新抽取`);
      continue;
    }

    return {
      row: Number(result.row),
      title,
      description,
    };
  }

  return null;
}

async function createWarningCasePost(item) {
  if (!SANITY_TOKEN) {
    throw new Error(
      '找不到 SANITY_TOKEN，請確認 GitHub Secrets 已設定'
    );
  }

  if (SANITY_TOKEN.includes('Bearer')) {
    throw new Error(
      'SANITY_TOKEN 不可包含 Bearer，只需存入 token 本體'
    );
  }

  const slug = createSlug(item.title);

  const document = {
    _type: SANITY_DOCUMENT_TYPE,
    title: item.title,
    slug: {
      _type: 'slug',
      current: slug,
    },
    describe: item.description,
  };

  const body = JSON.stringify({
    mutations: [
      {
        create: document,
      },
    ],
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: `${SANITY_PROJECT_ID}.api.sanity.io`,
        path: `/v2024-01-01/data/mutate/${SANITY_DATASET}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${SANITY_TOKEN}`,
          'Content-Length': Buffer.byteLength(body, 'utf8'),
        },
        timeout: REQUEST_TIMEOUT,
      },
      (res) => {
        const chunks = [];

        res.on('data', (chunk) => chunks.push(chunk));

        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');

          let parsed;

          try {
            parsed = JSON.parse(text);
          } catch {
            reject(
              new Error(`Sanity JSON 解析失敗：${text}`)
            );
            return;
          }

          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(
              new Error(
                `Sanity 發布失敗 HTTP ${res.statusCode}：${text}`
              )
            );
            return;
          }

          resolve({
            result: parsed,
            slug,
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(
        new Error(
          `Sanity 請求逾時，超過 ${REQUEST_TIMEOUT / 1000} 秒`
        )
      );
    });

    req.on('error', reject);
    req.write(Buffer.from(body, 'utf8'));
    req.end();
  });
}

async function markWarningCasePublished(row) {
  if (!row || row < 2) {
    throw new Error(`無效的 Google Sheet 列號：${row}`);
  }

  return postJsonToAppsScript(
    {
      warningCaseRow: row,
    },
    `回填第 ${row} 列 AB 欄 published`
  );
}

async function main() {
  console.log('==============================');
  console.log('🚧 踩雷案例獨立自動發布開始');
  console.log('==============================');

  const randomNumber = Math.floor(Math.random() * 4) + 1;

  console.log(`🎲 本次隨機數字：${randomNumber}`);

  if (randomNumber !== 1) {
    console.log('✅ 本次沒有抽中，不發布踩雷案例');
    return;
  }

  console.log('🎉 抽中 1，開始發布踩雷案例');

  const item = await fetchUnpublishedWarningCase();

  if (!item) {
    console.log('✅ 沒有可發布的踩雷案例');
    return;
  }

  console.log(`📌 Google Sheet 列號：${item.row}`);
  console.log(`📌 標題：${item.title}`);
  console.log(`📝 內容長度：${item.description.length}`);

  const created = await createWarningCasePost(item);

  console.log('✅ Sanity 踩雷案例建立成功');
  console.log(`🔗 Slug：${created.slug}`);

  await markWarningCasePublished(item.row);

  console.log(`✅ 第 ${item.row} 列 AB 欄已回填 published`);
}

main()
  .then(() => {
    console.log('✅ 全部流程完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 主流程失敗：', error.message);
    console.error(error.stack);
    process.exit(1);
  });
