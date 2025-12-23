const express = require('express');

const app = express();

// Railway / n8n 포트 처리
const PORT = process.env.PORT || 3000;

// JSON body 받기
app.use(express.json());

/**
 * ✅ 1. 헬스 체크 (무조건 최상단)
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'short-render-engine'
  });
});

/**
 * ✅ 2. n8n → 숏폼 렌더 트리거 엔드포인트
 */
app.post('/render/short', async (req, res) => {
  try {
    console.log('🎬 SHORT RENDER REQUEST RECEIVED');
    console.log(JSON.stringify(req.body, null, 2));

    res.json({
      status: 'received',
      message: 'short render job accepted'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'render failed' });
  }
});

/**
 * ❌ 3. 404 (맨 마지막!)
 */
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
