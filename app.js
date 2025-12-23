const express = require('express');
const path = require('path');

const app = express();

// ✅ Railway / n8n용 포트 처리
const PORT = process.env.PORT || 3000;

// ✅ JSON body 받기
app.use(express.json());

// ============================
// 1️⃣ 테스트용 헬스 체크
// ============================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'short-render-engine' });
});

// ============================
// 2️⃣ n8n → 숏폼 렌더 트리거 엔드포인트
// ============================
app.post('/render/short', async (req, res) => {
  try {
    const payload = req.body;

    console.log('📩 SHORT RENDER REQUEST RECEIVED');
    console.log(JSON.stringify(payload, null, 2));

    // 👉 지금은 렌더링 안 함 (다음 단계)
    // 👉 일단 "받았다"만 응답
    return res.json({
      success: true,
      message: 'Short render job received',
      receivedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('❌ ERROR:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ============================
// 3️⃣ 기본 페이지 (브라우저 접속용)
// ============================
app.get('/', (req, res) => {
  res.send('<h1>Short Render Engine is running</h1>');
});

// ============================
// 4️⃣ 서버 시작
// ============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
