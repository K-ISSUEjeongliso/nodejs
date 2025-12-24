const express = require('express');
const path = require('path');

const app = express();

// ✅ Railway / n8n용 포트
const PORT = process.env.PORT || 3000;

// ✅ JSON body 파싱 (핵심)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 모든 요청 로그 (진단용 핵심)
app.use((req, res, next) => {
  console.log('➡️ INCOMING REQUEST');
  console.log('METHOD:', req.method);
  console.log('PATH:', req.path);
  next();
});

// ============================
// 1️⃣ 헬스 체크
// ============================
app.get('/health', (req, res) => {
  console.log('✅ HEALTH CHECK HIT');
  res.json({ status: 'ok', service: 'short-render-engine' });
});

// ============================
// 2️⃣ n8n → 숏폼 렌더 트리거
// ============================
app.post('/render/short', async (req, res) => {
  console.log('🔥 /render/short ENDPOINT HIT');
  console.log('HEADERS:', req.headers);
  console.log('BODY:', JSON.stringify(req.body, null, 2));

  return res.json({
    success: true,
    message: 'Short render job received',
    receivedAt: new Date().toISOString(),
  });
});

// ============================
// 3️⃣ 루트 페이지
// ============================
app.get('/', (req, res) => {
  console.log('🏠 ROOT HIT');
  res.send('<h1>Short Render Engine is running</h1>');
});

// ============================
// 4️⃣ 서버 시작
// ============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
