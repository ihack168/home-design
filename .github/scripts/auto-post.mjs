import https from 'https';

const SANITY_PROJECT_ID = 'no0ub4vm';
const SANITY_DATASET = 'production';
const SANITY_TOKEN = process.env.SANITY_TOKEN;

const SHEET_NAME = 'linkrich';

const OFFICIAL_BASE_URL = 'https://home.line88.tw/blog';

const GOOGLE_SCRIPT_BASE_URL =
  'https://script.google.com/macros/s/AKfycbwFpZDhMveHhdOYdDkh02JpWk28jUCBqikyM-Urg_6Uw2jTH7d8ZluKxinKTWh5_20N/exec';

const GOOGLE_SCRIPT_URL =
  `${GOOGLE_SCRIPT_BASE_URL}?sheet=${encodeURIComponent(SHEET_NAME)}`;

const REQUEST_TIMEOUT = 15000;

function printSanityDebugInfo() {
  console.log('====================');
  console.log('🔍 Sanity Debug Info');
  console.log('====================');
  console.log(`🧩 Sanity Project：${SANITY_PROJECT_ID}`);
  console.log(`🧩 Sanity Dataset：${SANITY_DATASET}`);
  console.log(`🔐 SANITY_TOKEN 是否存在：${SANITY_TOKEN ? '有' : '沒有'}`);
  console.log(`🔐 SANITY_TOKEN 長度：${SANITY_TOKEN ? SANITY_TOKEN.length : 0}`);
  console.log(`🔐 SANITY_TOKEN 是否誤含 Bearer：${SANITY_TOKEN?.includes('Bearer') ? '是' : '否'}`);
  console.log(`🔐 SANITY_TOKEN 前 5 碼：${SANITY_TOKEN ? SANITY_TOKEN.slice(0, 5) : '(空)'}`);
  console.log(`🔐 SANITY_TOKEN 後 8 碼：${SANITY_TOKEN ? SANITY_TOKEN.slice(-8) : '(空)'}`);
  console.log('====================');
}

function getJsonFromUrl(url, label) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 GitHub-Actions-AutoPost',
        },
        timeout: REQUEST_TIMEOUT,
      },
      (res) => {
        console.log(`🌐 ${label} HTTP 狀態碼：${res.statusCode}`);

        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          console.log(`➡️ ${label} redirect 到：${res.headers.location}`);

          getJsonFromUrl(res.headers.location, `${label} redirect`)
            .then(resolve)
            .catch(reject);

          return;
        }

        const chunks = [];

        res.on('data', (chunk) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          const data = Buffer.concat(chunks).toString('utf8');

          console.log(`📦 ${label} 原始回傳：${data}`);

          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(new Error(`${label} JSON 解析失敗：${data}`));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`${label} 請求逾時，超過 ${REQUEST_TIMEOUT / 1000} 秒沒有回應`));
    });

    req.on('error', reject);
  });
}

function postJsonToAppsScript(payload, label) {
  const data = JSON.stringify(payload);

  return new Promise((resolve) => {
    const req = https.request(
      GOOGLE_SCRIPT_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(data, 'utf8'),
          'User-Agent': 'Mozilla/5.0 GitHub-Actions-AutoPost',
        },
        timeout: REQUEST_TIMEOUT,
      },
      (res) => {
        const chunks = [];

        console.log(`📝 ${label} Google Sheet HTTP 狀態碼：${res.statusCode}`);

        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          console.log(`➡️ ${label} redirect 到：${res.headers.location}`);

          const redirectReq = https.request(
            res.headers.location,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Length': Buffer.byteLength(data, 'utf8'),
                'User-Agent': 'Mozilla/5.0 GitHub-Actions-AutoPost',
              },
              timeout: REQUEST_TIMEOUT,
            },
            (res2) => {
              const redirectChunks = [];

              res2.on('data', (chunk) => {
                redirectChunks.push(chunk);
              });

              res2.on('end', () => {
                const redirectText = Buffer.concat(redirectChunks).toString('utf8');
                console.log(`📦 ${label} redirect 回傳：${redirectText}`);
                resolve(redirectText);
              });
            }
          );

          redirectReq.on('timeout', () => {
            redirectReq.destroy();
            console.error(`❌ ${label} redirect 請求逾時`);
            resolve('');
          });

          redirectReq.on('error', (e) => {
            console.error(`❌ ${label} redirect 失敗:`, e.message);
            resolve('');
          });

          redirectReq.write(Buffer.from(data, 'utf8'));
          redirectReq.end();
          return;
        }

        res.on('data', (chunk) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          console.log(`📦 ${label} 回傳：${text}`);
          resolve(text);
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      console.error(`❌ ${label} Google Sheet 請求逾時`);
      resolve('');
    });

    req.on('error', (e) => {
      console.error(`❌ ${label} 失敗:`, e.message);
      resolve('');
    });

    req.write(Buffer.from(data, 'utf8'));
    req.end();
  });
}

async function fetchNextPost() {
  return getJsonFromUrl(GOOGLE_SCRIPT_URL, 'Apps Script');
}

async function saveOfficialUrlToSheet(rowNumber, officialUrl) {
  return postJsonToAppsScript(
    {
      row: rowNumber,
      officialUrl: officialUrl,
    },
    '回寫 I 欄 officialUrl'
  );
}

async function markAsPublishedOnSheet(rowNumber) {
  return postJsonToAppsScript(
    {
      row: rowNumber,
    },
    '回填 published'
  );
}

function getSafePostCount(value) {
  const count = Number(value);

  if (!count || isNaN(count) || count < 1) {
    return 1;
  }

  return Math.floor(count);
}

function buildFinalHtml(title, htmlContent, webpImageUrl) {
  let finalHtml = htmlContent || '';

  const imageUrl = String(webpImageUrl || '').trim();

  console.log(`🖼️ H欄 webpImage 圖片網址：${imageUrl || '(空)'}`);

  if (imageUrl) {
    finalHtml = `<img src="${imageUrl}" alt="${title}">\n` + finalHtml;
  }

  return finalHtml;
}

async function createPost(title, htmlContent, tags, webpImageUrl) {
  if (!SANITY_TOKEN) {
    throw new Error('找不到 SANITY_TOKEN，請確認 GitHub Secrets 裡有設定 SANITY_TOKEN');
  }

  if (SANITY_TOKEN.includes('Bearer')) {
    throw new Error('SANITY_TOKEN 裡面不可以包含 Bearer，GitHub Secret 只要貼 token 本體');
  }

  const cleanTitle = title
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9]/g, '');

  const shortTitle = cleanTitle.substring(0, 15);
  const uniqueId = Math.floor(Date.now() / 1000).toString().slice(-6);
  const finalSlug = encodeURIComponent(shortTitle) + `-${uniqueId}`;
  const officialUrl = `${OFFICIAL_BASE_URL}/${finalSlug}`;

  console.log(`🔗 本篇 slug：${finalSlug}`);
  console.log(`🔗 本篇官網網址：${officialUrl}`);

  const finalHtml = buildFinalHtml(title, htmlContent, webpImageUrl);

  if (finalHtml.includes('�')) {
    console.warn('⚠️ 警告：準備寫入 Sanity 的 HTML 已經含有亂碼 �，請檢查 Apps Script 原始回傳');
  } else {
    console.log('✅ 準備寫入 Sanity 的 HTML 沒有偵測到亂碼 �');
  }

  const doc = {
    _type: 'post',
    title,
    slug: {
      _type: 'slug',
      current: finalSlug,
    },
    htmlContent: finalHtml,
    publishedAt: new Date().toISOString(),
    ...(tags
      ? {
          tags: tags
            .split(/[,，]/)
            .map((t) => t.trim())
            .filter(Boolean),
        }
      : {}),
  };

  const body = JSON.stringify({
    mutations: [
      {
        create: doc,
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

        console.log(`📡 Sanity HTTP 狀態碼：${res.statusCode}`);

        res.on('data', (chunk) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          const data = Buffer.concat(chunks).toString('utf8');

          console.log(`📦 Sanity 原始回傳：${data}`);

          let parsed;

          try {
            parsed = JSON.parse(data);
          } catch (error) {
            reject(new Error(`Sanity 回傳 JSON 解析失敗：${data}`));
            return;
          }

          if (res.statusCode === 403) {
            console.error('❌ Sanity 403：目前這顆 SANITY_TOKEN 沒有 create 權限');
            console.error('❌ 請確認 GitHub Secret SANITY_TOKEN 貼的是 Sanity 後台新建立的 Editor token');
            console.error('❌ 如果剛更新 Secret，請重新 Run workflow，不要用正在執行中的舊 workflow');
          }

          resolve({
            sanityResult: parsed,
            slug: finalSlug,
            officialUrl: officialUrl,
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Sanity 請求逾時，超過 ${REQUEST_TIMEOUT / 1000} 秒沒有回應`));
    });

    req.on('error', reject);
    req.write(Buffer.from(body, 'utf8'));
    req.end();
  });
}

async function main() {
  printSanityDebugInfo();

  console.log(`📥 從 Apps Script 讀取 sheet：${SHEET_NAME}`);
  console.log(`🔗 Apps Script URL：${GOOGLE_SCRIPT_URL}`);

  const firstPost = await fetchNextPost();

  if (!firstPost || firstPost.error) {
    console.log('✅ 無待處理文章');
    console.log(firstPost);
    return;
  }

  const postCount = getSafePostCount(firstPost.postCount);

  console.log(`📝 A6 設定本次發文數量：${firstPost.postCount}`);
  console.log(`🚀 本次實際預計發 ${postCount} 篇`);

  for (let i = 0; i < postCount; i++) {
    console.log('');
    console.log('====================');
    console.log(`🚀 第 ${i + 1} 篇 / 共 ${postCount} 篇`);
    console.log('====================');

    const post = i === 0 ? firstPost : await fetchNextPost();

    if (!post || post.error) {
      console.log('✅ 無待處理文章');
      console.log(post);
      break;
    }

    console.log(`📄 目前 sheet：${post.sheetName || SHEET_NAME}`);
    console.log(`📌 目前列號：${post.row}`);

    const title = String(post.title || '').trim();
    const html = String(post.html || '').trim();
    const tags = String(post.tags || '').trim();
    const webpImageUrl = String(post.webpImage || '').trim();

    console.log(`📌 標題：${title}`);
    console.log(`🏷️ Tags：${tags || '(空)'}`);
    console.log(`🖼️ H欄 webpImage：${webpImageUrl || '(空)'}`);

    if (!title || !html) {
      console.log('⚠️ 標題或 HTML 內容是空的，停止發文');
      console.log(post);
      break;
    }

    console.log(`🚀 發布：${title}`);

    const createResult = await createPost(title, html, tags, webpImageUrl);
    const sanityResult = createResult.sanityResult;

    if (sanityResult.results || sanityResult.mutations) {
      console.log('✅ Sanity 成功');

      console.log(`🔗 準備回寫 I 欄網址：${createResult.officialUrl}`);
      await saveOfficialUrlToSheet(post.row, createResult.officialUrl);
      console.log('✅ I 欄網址回寫完成');

      await markAsPublishedOnSheet(post.row);
      console.log('✅ G 欄 published 回填完成');
    } else {
      console.warn('⚠️ Sanity 回傳異常:', JSON.stringify(sanityResult));
      break;
    }
  }
}

main()
  .then(() => {
    console.log('✅ 全部流程完成，準備結束');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 主流程失敗 message:', error.message);
    console.error('❌ 主流程失敗 stack:', error.stack);
    process.exit(1);
  });