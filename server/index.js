const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const Pin = require('./models/Pin');

// 載入環境變數
dotenv.config();

// 初始化 Express 應用
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://hk-pet-protection-map.vercel.app'] 
      : ['http://localhost:3000'],
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true
  }
});

// 設定中間件
app.use(express.json({ limit: '50mb' }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://hk-pet-protection-map.vercel.app' 
    : 'http://localhost:3000',
  credentials: true
}));

// 連接到 MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('已成功連接到 MongoDB');
    preloadSampleData(); // 預載樣本數據
  })
  .catch(err => {
    console.error('MongoDB 連接錯誤:', err);
  });

// 預加載示例數據（如果數據庫為空）
async function preloadSampleData() {
  try {
    const count = await Pin.countDocuments();
    if (count === 0) {
      console.log('數據庫為空，正在加載示例數據...');
      
      const mockData = [
        {
          locationName: '中環 (Central)',
          position: [22.2783, 114.1747],
          username: '動物愛好者',
          description: '發現多隻流浪貓聚集',
          type: '一般報告 📝'
        },
        {
          locationName: '旺角 (Mong Kok)',
          position: [22.3167, 114.1717],
          username: '志願者',
          description: '看到流浪狗尋找食物',
          type: '一般報告 📝'
        },
        {
          locationName: '尖沙咀 (Tsim Sha Tsui)',
          position: [22.2988, 114.1722],
          username: '市民A',
          description: '發現可疑毒餌',
          type: '針對動物的毒害 ⚠️'
        },
        {
          locationName: '銅鑼灣 (Causeway Bay)',
          position: [22.2807, 114.1848],
          username: '愛貓人士',
          description: '流浪貓受傷需救助',
          type: '一般報告 📝'
        },
        {
          locationName: '九龍公園 (Kowloon Park)',
          position: [22.3000, 114.1700],
          username: '保護者',
          description: '有人虐待流浪狗',
          type: '動物虐待 🆘'
        },
        {
          locationName: '沙田 (Sha Tin)',
          position: [22.3811, 114.1888],
          username: '熱心人',
          description: '公園內發現毒物',
          type: '針對動物的毒害 ⚠️'
        },
        {
          locationName: '荃灣 (Tsuen Wan)',
          position: [22.3707, 114.1048],
          username: '狗主',
          description: '流浪狗被拋棄',
          type: '一般報告 📝'
        },
        {
          locationName: '元朗 (Yuen Long)',
          position: [22.4445, 114.0222],
          username: '居民B',
          description: '農田附近有虐待貓行為',
          type: '動物虐待 🆘'
        },
        {
          locationName: '西貢 (Sai Kung)',
          position: [22.3813, 114.2705],
          username: '行山者',
          description: '發現受傷流浪狗',
          type: '一般報告 📝'
        },
        {
          locationName: '大埔 (Tai Po)',
          position: [22.4480, 114.1642],
          username: '學生',
          description: '工業區內發現毒餌',
          type: '針對動物的毒害 ⚠️'
        },
        {
          locationName: '觀塘 (Kwun Tong)',
          position: [22.3121, 114.2257],
          username: '義工',
          description: '流浪貓被困需救援',
          type: '一般報告 📝'
        },
        {
          locationName: '深水埗 (Sham Shui Po)',
          position: [22.3307, 114.1622],
          username: '關注者',
          description: '有人虐待街頭動物',
          type: '動物虐待 🆘'
        },
        {
          locationName: '維多利亞公園 (Victoria Park)',
          position: [22.2820, 114.1902],
          username: '跑步者',
          description: '公園角落有毒物',
          type: '針對動物的毒害 ⚠️'
        },
        {
          locationName: '油麻地 (Yau Ma Tei)',
          position: [22.3128, 114.1708],
          username: '市民C',
          description: '流浪狗需醫療救助',
          type: '一般報告 📝'
        },
        {
          locationName: '屯門 (Tuen Mun)',
          position: [22.3918, 113.9725],
          username: '愛狗人士',
          description: '發現虐待動物案件',
          type: '動物虐待 🆘'
        },
        {
          locationName: '北角 (North Point)',
          position: [22.2910, 114.2007],
          username: '街坊',
          description: '後巷有可疑毒物',
          type: '針對動物的毒害 ⚠️'
        },
        {
          locationName: '大嶼山 (Lantau Island)',
          position: [22.2687, 113.9461],
          username: '村民',
          description: '發現被遺棄的貓',
          type: '一般報告 📝'
        },
        {
          locationName: '將軍澳 (Tseung Kwan O)',
          position: [22.3080, 114.2586],
          username: '家庭',
          description: '有人虐待流浪貓',
          type: '動物虐待 🆘'
        },
        {
          locationName: '紅磡 (Hung Hom)',
          position: [22.3061, 114.1838],
          username: '工作者',
          description: '碼頭附近有毒餌',
          type: '針對動物的毒害 ⚠️'
        },
        {
          locationName: '石硤尾 (Shek Kip Mei)',
          position: [22.3330, 114.1668],
          username: '居民D',
          description: '流浪動物聚集需關注',
          type: '一般報告 📝'
        }
      ];
      
      await Pin.insertMany(mockData);
      console.log('已成功添加 20 個示例地點到數據庫');
    } else {
      console.log(`數據庫中已有 ${count} 個地點記錄`);
    }
  } catch (error) {
    console.error('加載示例數據時出錯:', error);
  }
}

// API 路由：獲取所有地點
app.get('/api/pins', async (req, res) => {
  try {
    const pins = await Pin.find().sort({ createdAt: -1 });
    res.json(pins);
  } catch (error) {
    console.error('獲取地點數據錯誤:', error);
    res.status(500).json({ message: '獲取地點數據時出錯', error: error.message });
  }
});

// API 路由：添加新地點
app.post('/api/pins', async (req, res) => {
  try {
    const newPin = new Pin(req.body);
    const savedPin = await newPin.save();
    
    // 使用 Socket.IO 廣播新地點給所有連接的客戶端
    io.emit('newPin', savedPin);
    
    res.status(201).json(savedPin);
  } catch (error) {
    console.error('添加地點數據錯誤:', error);
    res.status(400).json({ message: '添加地點時出錯', error: error.message });
  }
});

// API 路由：刪除所有地點
app.delete('/api/pins', async (req, res) => {
  try {
    await Pin.deleteMany({});
    
    // 使用 Socket.IO 通知所有客戶端數據已被清除
    io.emit('clearPins');
    
    res.json({ message: '所有地點已成功刪除' });
  } catch (error) {
    console.error('刪除地點數據錯誤:', error);
    res.status(500).json({ message: '刪除地點時出錯', error: error.message });
  }
});

// Socket.IO 連接處理
io.on('connection', (socket) => {
  console.log('新客戶端已連接:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('客戶端已斷開連接:', socket.id);
  });
});

// 啟動服務器
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`服務器已在端口 ${PORT} 上啟動`);
}); 