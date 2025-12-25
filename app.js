const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// JSON 파싱
app.use(express.json());

// 로그
app.use((req, res, next) => {
  console.log('➡️', req.method, req.path);
  next();
});

// 헬스체크
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'short-render-engine' });
});

// 테스트용 렌더 엔드포인트 (DB 없음)
app.post('/render/short', (req, res) => {
  console.log('RENDER REQUEST BODY:', req.body);

  res.json({
    success: true,
    message: 'Short render job received',
    receivedAt: new Date().toISOString()
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
