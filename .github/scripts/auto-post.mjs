import https from 'https';

const SANITY_PROJECT_ID = 'gq4nr57o';
const SANITY_DATASET = 'production';
const SANITY_TOKEN = process.env.SANITY_TOKEN;

const SHEET_NAME = 'home-design';

const OFFICIAL_BASE_URL = 'https://www.deco77.com/blog';

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


function downloadImageBuffer(url, label, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    const cleanUrl = String(url || '').trim();

    if (!cleanUrl) {
      resolve(null);
      return;
    }

    if (redirectCount > 5) {
      reject(new Error(`${label} 下載失敗：重新導向次數過多`));
      return;
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(cleanUrl);
    } catch (error) {
      reject(new Error(`${label} 圖片網址格式錯誤：${cleanUrl}`));
      return;
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      reject(new Error(`${label} 圖片網址只允許 http 或 https：${cleanUrl}`));
      return;
    }

    const request = https.get(
      cleanUrl,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 GitHub-Actions-AutoPost',
          Accept: 'image/*',
        },
        timeout: REQUEST_TIMEOUT,
      },
      (res) => {
        console.log(`🖼️ ${label} 下載 HTTP 狀態碼：${res.statusCode}`);

        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          const redirectUrl = new URL(
            res.headers.location,
            cleanUrl
          ).toString();

          res.resume();

          downloadImageBuffer(
            redirectUrl,
            label,
            redirectCount + 1
          )
            .then(resolve)
            .catch(reject);

          return;
        }

        if (res.statusCode < 200 || res.statusCode >= 300) {
          const chunks = [];

          res.on('data', (chunk) => {
            chunks.push(chunk);
          });

          res.on('end', () => {
            const responseText = Buffer.concat(chunks).toString('utf8');

            reject(
              new Error(
                `${label} 圖片下載失敗，HTTP ${res.statusCode}：${responseText}`
              )
            );
          });

          return;
        }

        const contentType = String(
          res.headers['content-type'] || ''
        )
          .split(';')[0]
          .trim()
          .toLowerCase();

        if (!contentType.startsWith('image/')) {
          res.resume();

          reject(
            new Error(
              `${label} 網址回傳的不是圖片，Content-Type：${contentType || '(空)'}`
            )
          );
          return;
        }

        const chunks = [];

        res.on('data', (chunk) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          const buffer = Buffer.concat(chunks);

          if (buffer.length === 0) {
            reject(new Error(`${label} 圖片內容是空的`));
            return;
          }

          resolve({
            buffer,
            contentType,
            finalUrl: cleanUrl,
          });
        });
      }
    );

    request.on('timeout', () => {
      request.destroy();

      reject(
        new Error(
          `${label} 圖片下載逾時，超過 ${REQUEST_TIMEOUT / 1000} 秒`
        )
      );
    });

    request.on('error', reject);
  });
}

function getImageExtension(contentType, imageUrl) {
  const contentTypeMap = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/tiff': 'tif',
    'image/svg+xml': 'svg',
    'image/avif': 'avif',
  };

  if (contentTypeMap[contentType]) {
    return contentTypeMap[contentType];
  }

  try {
    const pathname = new URL(imageUrl).pathname;
    const match = pathname.match(/\.([a-zA-Z0-9]{2,5})$/);

    if (match) {
      return match[1].toLowerCase();
    }
  } catch (error) {
    // 無法解析副檔名時，使用 jpg 作為檔名副檔名。
  }

  return 'jpg';
}

function uploadImageBufferToSanity(
  imageData,
  filename,
  label
) {
  return new Promise((resolve, reject) => {
    const encodedFilename = encodeURIComponent(filename);

    const req = https.request(
      {
        hostname: `${SANITY_PROJECT_ID}.api.sanity.io`,
        path:
          `/v2024-06-24/assets/images/${SANITY_DATASET}` +
          `?filename=${encodedFilename}`,
        method: 'POST',
        headers: {
          'Content-Type': imageData.contentType,
          Authorization: `Bearer ${SANITY_TOKEN}`,
          'Content-Length': imageData.buffer.length,
        },
        timeout: REQUEST_TIMEOUT,
      },
      (res) => {
        const chunks = [];

        console.log(
          `☁️ ${label} 上傳 Sanity HTTP 狀態碼：${res.statusCode}`
        );

        res.on('data', (chunk) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          const responseText = Buffer.concat(chunks).toString('utf8');

          console.log(`📦 ${label} 上傳 Sanity 回傳：${responseText}`);

          let parsed;

          try {
            parsed = JSON.parse(responseText);
          } catch (error) {
            reject(
              new Error(
                `${label} 上傳回傳 JSON 解析失敗：${responseText}`
              )
            );
            return;
          }

          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(
              new Error(
                `${label} 上傳 Sanity 失敗，HTTP ${res.statusCode}：${responseText}`
              )
            );
            return;
          }

          const assetId =
            parsed?.document?._id ||
            parsed?._id ||
            parsed?.asset?._id ||
            '';

          if (!assetId) {
            reject(
              new Error(
                `${label} 上傳成功但找不到 asset ID：${responseText}`
              )
            );
            return;
          }

          resolve(assetId);
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();

      reject(
        new Error(
          `${label} 上傳 Sanity 逾時，超過 ${REQUEST_TIMEOUT / 1000} 秒`
        )
      );
    });

    req.on('error', reject);
    req.write(imageData.buffer);
    req.end();
  });
}

async function uploadRoomImage(
  imageUrl,
  roomKey,
  roomLabel,
  title
) {
  const cleanUrl = String(imageUrl || '').trim();

  if (!cleanUrl) {
    console.log(`⏭️ ${roomLabel}沒有圖片，略過`);
    return null;
  }

  console.log(`⬇️ 準備下載${roomLabel}圖片：${cleanUrl}`);

  const imageData = await downloadImageBuffer(
    cleanUrl,
    `${roomLabel}圖片`
  );

  const extension = getImageExtension(
    imageData.contentType,
    imageData.finalUrl
  );

  const safeTitle = String(title || 'home-design')
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'home-design';

  const filename =
    `${safeTitle}-${roomKey}-${Date.now()}.${extension}`;

  const assetId = await uploadImageBufferToSanity(
    imageData,
    filename,
    `${roomLabel}圖片`
  );

  console.log(`✅ ${roomLabel}圖片上傳完成：${assetId}`);

  return {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: assetId,
    },
    alt: `${title}${roomLabel}室內設計`,
  };
}


async function createPost(
  title,
  htmlContent,
  tags,
  webpImageUrl,
  roomImageUrls = {}
) {
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
  const uniqueId = Math.floor(10000000 + Math.random() * 90000000).toString();
  const finalSlug = encodeURIComponent(shortTitle) + `-${uniqueId}`;
  const officialUrl = `${OFFICIAL_BASE_URL}/${finalSlug}`;

  console.log(`🔗 本篇 slug：${finalSlug}`);
  console.log(`🔗 本篇官網網址：${officialUrl}`);

  const finalHtml = buildFinalHtml(title, htmlContent, webpImageUrl);

  const shouldUploadRoomImages = SHEET_NAME === 'home-design';

  const diningRoomImage = shouldUploadRoomImages
    ? await uploadRoomImage(
        roomImageUrls.diningRoomImageUrl,
        'dining-room',
        '餐廳',
        title
      )
    : null;

  const masterBedroomImage = shouldUploadRoomImages
    ? await uploadRoomImage(
        roomImageUrls.masterBedroomImageUrl,
        'master-bedroom',
        '主臥',
        title
      )
    : null;

  const secondBedroomImage = shouldUploadRoomImages
    ? await uploadRoomImage(
        roomImageUrls.secondBedroomImageUrl,
        'second-bedroom',
        '次臥',
        title
      )
    : null;

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
    ...(diningRoomImage
      ? {
          diningRoomImage,
        }
      : {}),
    ...(masterBedroomImage
      ? {
          masterBedroomImage,
        }
      : {}),
    ...(secondBedroomImage
      ? {
          secondBedroomImage,
        }
      : {}),
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

    const diningRoomImageUrl = String(
      post.diningRoomImageUrl || ''
    ).trim();

    const masterBedroomImageUrl = String(
      post.masterBedroomImageUrl || ''
    ).trim();

    const secondBedroomImageUrl = String(
      post.secondBedroomImageUrl || ''
    ).trim();

    console.log(`📌 標題：${title}`);
    console.log(`🏷️ Tags：${tags || '(空)'}`);
    console.log(`🖼️ H欄 webpImage：${webpImageUrl || '(空)'}`);
    console.log(
      `🍽️ K欄餐廳圖片：${diningRoomImageUrl || '(空)'}`
    );
    console.log(
      `🛏️ K欄主臥圖片：${masterBedroomImageUrl || '(空)'}`
    );
    console.log(
      `🛌 K欄次臥圖片：${secondBedroomImageUrl || '(空)'}`
    );

    if (!title || !html) {
      console.log('⚠️ 標題或 HTML 內容是空的，停止發文');
      console.log(post);
      break;
    }

    console.log(`🚀 發布：${title}`);

    const createResult = await createPost(
      title,
      html,
      tags,
      webpImageUrl,
      {
        diningRoomImageUrl,
        masterBedroomImageUrl,
        secondBedroomImageUrl,
      }
    );
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