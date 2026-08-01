import https from 'https';

const SANITY_PROJECT_ID = 'gq4nr57o';
const SANITY_DATASET = 'production';
const SANITY_TOKEN = process.env.SANITY_TOKEN;

const SHEET_NAME = 'home-design';

const GOOGLE_SCRIPT_BASE_URL =
  'https://script.google.com/macros/s/AKfycbwFpZDhMveHhdOYdDkh02JpWk28jUCBqikyM-Urg_6Uw2jTH7d8ZluKxinKTWh5_20N/exec';

const GOOGLE_SCRIPT_URL =
  `${GOOGLE_SCRIPT_BASE_URL}?sheet=${encodeURIComponent(SHEET_NAME)}`;

// GAS 必須提供 action=roomImageBackfillCandidates。
// 每次最多處理幾篇，第一次建議維持 1，確認正確後再調大。
const MAX_POSTS_PER_RUN = 1;

// true：只檢查、不寫入 Sanity。
// false：實際上傳圖片並補進文章欄位。
const DRY_RUN = false;

const REQUEST_TIMEOUT = 30000;

function assertEnvironment() {
  if (!SANITY_TOKEN) {
    throw new Error(
      '找不到 SANITY_TOKEN，請確認 GitHub Secrets 已設定 SANITY_TOKEN'
    );
  }

  if (SANITY_TOKEN.includes('Bearer')) {
    throw new Error(
      'SANITY_TOKEN 不可以包含 Bearer，只能儲存 token 本體'
    );
  }
}

function requestBuffer(url, options = {}, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      reject(new Error(`重新導向次數過多：${url}`));
      return;
    }

    const parsedUrl = new URL(url);

    const req = https.request(
      parsedUrl,
      {
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: options.timeout || REQUEST_TIMEOUT,
      },
      (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          const redirectUrl = new URL(
            res.headers.location,
            parsedUrl
          ).toString();

          res.resume();

          requestBuffer(
            redirectUrl,
            options,
            redirectCount + 1
          )
            .then(resolve)
            .catch(reject);

          return;
        }

        const chunks = [];

        res.on('data', (chunk) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            buffer: Buffer.concat(chunks),
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(
        new Error(
          `請求逾時，超過 ${REQUEST_TIMEOUT / 1000} 秒：${url}`
        )
      );
    });

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

async function getJson(url, label) {
  const response = await requestBuffer(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 GitHub-Actions-CheckPost',
      Accept: 'application/json',
    },
  });

  const text = response.buffer.toString('utf8');

  console.log(`🌐 ${label} HTTP：${response.statusCode}`);

  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(
      `${label} 請求失敗，HTTP ${response.statusCode}：${text}`
    );
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} JSON 解析失敗：${text}`);
  }
}


async function postJsonToAppsScript(payload, label) {
  const body = Buffer.from(
    JSON.stringify(payload),
    'utf8'
  );

  const response = await requestBuffer(
    GOOGLE_SCRIPT_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': body.length,
        'User-Agent':
          'Mozilla/5.0 GitHub-Actions-CheckPost',
      },
      body,
    }
  );

  const text = response.buffer.toString('utf8');

  console.log(
    `📝 ${label} Apps Script HTTP：${response.statusCode}`
  );
  console.log(`📦 ${label} Apps Script 回傳：${text}`);

  if (
    response.statusCode < 200 ||
    response.statusCode >= 300
  ) {
    throw new Error(
      `${label} Apps Script 失敗，HTTP ` +
      `${response.statusCode}：${text}`
    );
  }

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    // Apps Script 某些成功回應可能是純文字。
    return {
      success: true,
      raw: text,
    };
  }
}

async function saveBackfillStatus(row, status) {
  if (!row) {
    console.warn(
      `⚠️ 無法回寫補圖狀態，row 不正確：${row}`
    );
    return;
  }

  await postJsonToAppsScript(
    {
      action: 'roomImageBackfillResult',
      row,
      status,
    },
    `回寫 AC 欄補圖狀態：${status}`
  );
}

async function postSanityMutation(mutations, label) {
  const body = Buffer.from(
    JSON.stringify({
      mutations,
    }),
    'utf8'
  );

  const url =
    `https://${SANITY_PROJECT_ID}.api.sanity.io` +
    `/v2024-01-01/data/mutate/${SANITY_DATASET}` +
    '?returnIds=true&visibility=sync';

  const response = await requestBuffer(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${SANITY_TOKEN}`,
      'Content-Length': body.length,
    },
    body,
  });

  const text = response.buffer.toString('utf8');

  console.log(`📡 ${label} HTTP：${response.statusCode}`);
  console.log(`📦 ${label} 回傳：${text}`);

  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} JSON 解析失敗：${text}`);
  }

  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(
      `${label} 失敗，HTTP ${response.statusCode}：${text}`
    );
  }

  return parsed;
}

function extractSlug(officialUrl, fallbackSlug = '') {
  const cleanFallback = String(fallbackSlug || '').trim();

  if (cleanFallback) {
    return decodeURIComponent(cleanFallback);
  }

  const cleanUrl = String(officialUrl || '').trim();

  if (!cleanUrl) return '';

  try {
    const pathname = new URL(cleanUrl).pathname;
    const segments = pathname.split('/').filter(Boolean);
    const blogIndex = segments.lastIndexOf('blog');

    if (blogIndex >= 0 && segments[blogIndex + 1]) {
      return decodeURIComponent(segments[blogIndex + 1]);
    }

    return decodeURIComponent(segments.at(-1) || '');
  } catch (error) {
    return '';
  }
}

async function fetchBackfillCandidates() {
  const url =
    `${GOOGLE_SCRIPT_URL}` +
    `&action=roomImageBackfillCandidates` +
    `&limit=${encodeURIComponent(MAX_POSTS_PER_RUN)}`;

  const result = await getJson(url, '取得舊文章補圖清單');

  if (!result || result.success !== true) {
    throw new Error(
      `GAS 沒有正確回傳補圖清單：${JSON.stringify(result)}`
    );
  }

  if (!Array.isArray(result.items)) {
    throw new Error(
      'GAS 回傳格式錯誤：找不到 items 陣列。請確認 GAS 已加入 roomImageBackfillCandidates'
    );
  }

  return result.items;
}

async function findSanityPostBySlug(slug) {
  const query = `*[
    _type == "post" &&
    slug.current == $slug
  ][0] {
    _id,
    title,
    "slug": slug.current,
    "hasDiningRoomImage": defined(diningRoomImage.asset._ref),
    "hasMasterBedroomImage": defined(masterBedroomImage.asset._ref),
    "hasSecondBedroomImage": defined(secondBedroomImage.asset._ref)
  }`;

  const params = new URLSearchParams();
  params.set('query', query);
  params.set('$slug', JSON.stringify(slug));

  const url =
    `https://${SANITY_PROJECT_ID}.api.sanity.io` +
    `/v2024-01-01/data/query/${SANITY_DATASET}` +
    `?${params.toString()}`;

  const response = await getJson(
    url,
    `查詢 Sanity slug：${slug}`
  );

  return response.result || null;
}

async function downloadImage(imageUrl, label) {
  const cleanUrl = String(imageUrl || '').trim();

  if (!cleanUrl) return null;

  let parsedUrl;

  try {
    parsedUrl = new URL(cleanUrl);
  } catch (error) {
    throw new Error(`${label}網址格式錯誤：${cleanUrl}`);
  }

  if (!['https:', 'http:'].includes(parsedUrl.protocol)) {
    throw new Error(`${label}只允許 http 或 https 網址`);
  }

  const response = await requestBuffer(cleanUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 GitHub-Actions-CheckPost',
      Accept: 'image/*',
    },
  });

  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(
      `${label}下載失敗，HTTP ${response.statusCode}`
    );
  }

  const contentType = String(
    response.headers['content-type'] || ''
  )
    .split(';')[0]
    .trim()
    .toLowerCase();

  if (!contentType.startsWith('image/')) {
    throw new Error(
      `${label}網址回傳的不是圖片，Content-Type：${contentType || '(空)'}`
    );
  }

  if (response.buffer.length === 0) {
    throw new Error(`${label}圖片內容是空的`);
  }

  return {
    buffer: response.buffer,
    contentType,
    sourceUrl: cleanUrl,
  };
}

function getImageExtension(contentType, sourceUrl) {
  const extensions = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
    'image/tiff': 'tif',
    'image/svg+xml': 'svg',
  };

  if (extensions[contentType]) {
    return extensions[contentType];
  }

  try {
    const match = new URL(sourceUrl).pathname.match(
      /\.([a-zA-Z0-9]{2,5})$/
    );

    if (match) {
      return match[1].toLowerCase();
    }
  } catch (error) {
    // 無法取得副檔名時使用 jpg。
  }

  return 'jpg';
}

async function uploadImageToSanity(
  imageUrl,
  filenamePrefix,
  label
) {
  const image = await downloadImage(imageUrl, label);

  if (!image) return null;

  const extension = getImageExtension(
    image.contentType,
    image.sourceUrl
  );

  const filename =
    `${filenamePrefix}-${Date.now()}.${extension}`;

  const url =
    `https://${SANITY_PROJECT_ID}.api.sanity.io` +
    `/v2024-06-24/assets/images/${SANITY_DATASET}` +
    `?filename=${encodeURIComponent(filename)}`;

  const response = await requestBuffer(url, {
    method: 'POST',
    headers: {
      'Content-Type': image.contentType,
      Authorization: `Bearer ${SANITY_TOKEN}`,
      'Content-Length': image.buffer.length,
    },
    body: image.buffer,
  });

  const text = response.buffer.toString('utf8');

  console.log(`☁️ ${label}上傳 HTTP：${response.statusCode}`);
  console.log(`📦 ${label}上傳回傳：${text}`);

  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new Error(`${label}上傳回傳 JSON 解析失敗：${text}`);
  }

  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(
      `${label}上傳失敗，HTTP ${response.statusCode}：${text}`
    );
  }

  const assetId =
    parsed?.document?._id ||
    parsed?._id ||
    parsed?.asset?._id ||
    '';

  if (!assetId) {
    throw new Error(
      `${label}上傳成功，但找不到 Sanity asset ID`
    );
  }

  return assetId;
}

function createSanityImageValue(assetId, alt) {
  return {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: assetId,
    },
    alt,
  };
}

function makeSafeFilename(value) {
  return (
    String(value || 'home-design')
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50) || 'home-design'
  );
}

async function processCandidate(item, index, total) {
  console.log('');
  console.log('==================================================');
  console.log(`🧩 第 ${index + 1} 筆 / 共 ${total} 筆`);
  console.log('==================================================');

  const row = Number(item.row);
  const officialUrl = String(item.officialUrl || '').trim();
  const slug = extractSlug(officialUrl, item.slug);

  const diningRoomImageUrl = String(
    item.diningRoomImageUrl || ''
  ).trim();

  const masterBedroomImageUrl = String(
    item.masterBedroomImageUrl || ''
  ).trim();

  const secondBedroomImageUrl = String(
    item.secondBedroomImageUrl || ''
  ).trim();

  console.log(`📌 Sheet 列號：${row || '(未知)'}`);
  console.log(`🔗 I欄網址：${officialUrl || '(空)'}`);
  console.log(`🔑 slug：${slug || '(空)'}`);
  console.log(
    `🍽️ 餐廳圖片網址：${diningRoomImageUrl || '(空)'}`
  );
  console.log(
    `🛏️ 主臥圖片網址：${masterBedroomImageUrl || '(空)'}`
  );
  console.log(
    `🛌 次臥圖片網址：${secondBedroomImageUrl || '(空)'}`
  );

  if (!slug) {
    console.warn('⚠️ 無法取得 slug，略過此列');
    return {
      status: 'post-not-found',
      row,
      reason: 'missing-slug',
    };
  }

  const sanityPost = await findSanityPostBySlug(slug);

  if (!sanityPost || !sanityPost._id) {
    console.warn(`⚠️ Sanity 找不到文章：${slug}`);

    return {
      status: 'post-not-found',
      row,
      slug,
    };
  }

  console.log(`✅ 找到 Sanity 文件：${sanityPost._id}`);
  console.log(`📄 Sanity 標題：${sanityPost.title}`);

  const missingImages = {
    diningRoom:
      Boolean(diningRoomImageUrl) &&
      !sanityPost.hasDiningRoomImage,

    masterBedroom:
      Boolean(masterBedroomImageUrl) &&
      !sanityPost.hasMasterBedroomImage,

    secondBedroom:
      Boolean(secondBedroomImageUrl) &&
      !sanityPost.hasSecondBedroomImage,
  };

  console.log(
    `🔍 餐廳需要補：${missingImages.diningRoom ? '是' : '否'}`
  );
  console.log(
    `🔍 主臥需要補：${missingImages.masterBedroom ? '是' : '否'}`
  );
  console.log(
    `🔍 次臥需要補：${missingImages.secondBedroom ? '是' : '否'}`
  );

  if (
    !missingImages.diningRoom &&
    !missingImages.masterBedroom &&
    !missingImages.secondBedroom
  ) {
    console.log('✅ 這篇沒有缺少需要補上的房間圖片');

    return {
      status: 'nothing-to-update',
      row,
      slug,
      documentId: sanityPost._id,
    };
  }

  if (DRY_RUN) {
    console.log('🧪 DRY_RUN=true，只檢查不寫入');

    return {
      status: 'dry-run',
      row,
      slug,
      documentId: sanityPost._id,
      missingImages,
    };
  }

  const safeName = makeSafeFilename(
    `${slug}-${row || 'row'}`
  );

  const setFields = {};

  if (missingImages.diningRoom) {
    const assetId = await uploadImageToSanity(
      diningRoomImageUrl,
      `${safeName}-dining-room`,
      '餐廳圖片'
    );

    setFields.diningRoomImage = createSanityImageValue(
      assetId,
      `${sanityPost.title}餐廳室內設計`
    );
  }

  if (missingImages.masterBedroom) {
    const assetId = await uploadImageToSanity(
      masterBedroomImageUrl,
      `${safeName}-master-bedroom`,
      '主臥圖片'
    );

    setFields.masterBedroomImage = createSanityImageValue(
      assetId,
      `${sanityPost.title}主臥室內設計`
    );
  }

  if (missingImages.secondBedroom) {
    const assetId = await uploadImageToSanity(
      secondBedroomImageUrl,
      `${safeName}-second-bedroom`,
      '次臥圖片'
    );

    setFields.secondBedroomImage = createSanityImageValue(
      assetId,
      `${sanityPost.title}次臥室內設計`
    );
  }

  if (Object.keys(setFields).length === 0) {
    console.log('✅ 沒有需要寫入的欄位');

    return {
      status: 'nothing-to-update',
      row,
      slug,
      documentId: sanityPost._id,
    };
  }

  await postSanityMutation(
    [
      {
        patch: {
          id: sanityPost._id,
          set: setFields,
        },
      },
    ],
    `更新文章房間圖片：${slug}`
  );

  console.log(
    `✅ 補圖完成：${Object.keys(setFields).join(', ')}`
  );

  return {
    status: 'updated',
    row,
    slug,
    documentId: sanityPost._id,
    updatedFields: Object.keys(setFields),
  };
}

async function main() {
  assertEnvironment();

  console.log('==================================================');
  console.log('🏠 室內設計舊文章補圖工具');
  console.log('==================================================');
  console.log(`🧩 Sanity Project：${SANITY_PROJECT_ID}`);
  console.log(`🧩 Sanity Dataset：${SANITY_DATASET}`);
  console.log(`📄 Google Sheet：${SHEET_NAME}`);
  console.log(`🔢 本次最多處理：${MAX_POSTS_PER_RUN} 篇`);
  console.log(`🧪 DRY_RUN：${DRY_RUN}`);
  console.log('==================================================');

  const candidates = await fetchBackfillCandidates();

  if (candidates.length === 0) {
    console.log('✅ 沒有需要檢查的舊文章');
    return;
  }

  console.log(`📥 GAS 回傳 ${candidates.length} 筆候選文章`);

  const results = [];

  for (let index = 0; index < candidates.length; index++) {
    const candidate = candidates[index];

    try {
      const result = await processCandidate(
        candidate,
        index,
        candidates.length
      );

      results.push(result);

      if (result.status === 'updated') {
        await saveBackfillStatus(
          result.row,
          'images-updated'
        );
      } else if (
        result.status === 'nothing-to-update'
      ) {
        await saveBackfillStatus(
          result.row,
          'nothing-to-update'
        );
      } else if (
        result.status === 'post-not-found'
      ) {
        await saveBackfillStatus(
          result.row,
          'post-not-found'
        );
      }
    } catch (error) {
      console.error(
        `❌ 第 ${index + 1} 筆處理失敗：${error.message}`
      );

      const failedResult = {
        status: 'failed',
        row: candidate?.row,
        error: error.message,
      };

      results.push(failedResult);

      try {
        await saveBackfillStatus(
          candidate?.row,
          'update-failed'
        );
      } catch (statusError) {
        console.error(
          `❌ AC欄失敗狀態回寫失敗：${statusError.message}`
        );
      }
    }
  }

  const updatedCount = results.filter(
    (item) => item.status === 'updated'
  ).length;

  const failedCount = results.filter(
    (item) => item.status === 'failed'
  ).length;

  console.log('');
  console.log('==================================================');
  console.log('📊 本次補圖結果');
  console.log('==================================================');
  console.log(`✅ 成功更新：${updatedCount} 篇`);
  console.log(`❌ 處理失敗：${failedCount} 篇`);
  console.log(`📦 全部結果：${JSON.stringify(results, null, 2)}`);

  if (failedCount > 0) {
    throw new Error(
      `本次共有 ${failedCount} 篇處理失敗，請查看上方紀錄`
    );
  }
}

main()
  .then(() => {
    console.log('✅ check-post.mjs 全部流程完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ check-post.mjs 執行失敗：', error.message);
    console.error(error.stack);
    process.exit(1);
  });
