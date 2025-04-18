import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// 事件類型
const INCIDENT_TYPES = {
  GENERAL: '一般報告 📝',
  POISONING: '針對動物的毒害 ⚠️',
  ABUSE: '動物虐待 🆘'
};

// 初始化本地存儲的示例數據
const mockData = [
  {
    id: 1,
    locationName: '中環 (Central)',
    position: [22.2783, 114.1747],
    username: '動物愛好者',
    description: '發現多隻流浪貓聚集',
    type: INCIDENT_TYPES.GENERAL
  },
  {
    id: 2,
    locationName: '旺角 (Mong Kok)',
    position: [22.3167, 114.1717],
    username: '志願者',
    description: '看到流浪狗尋找食物',
    type: INCIDENT_TYPES.GENERAL
  },
  {
    id: 3,
    locationName: '尖沙咀 (Tsim Sha Tsui)',
    position: [22.2988, 114.1722],
    username: '市民A',
    description: '發現可疑毒餌',
    type: INCIDENT_TYPES.POISONING
  },
  {
    id: 4,
    locationName: '銅鑼灣 (Causeway Bay)',
    position: [22.2807, 114.1848],
    username: '愛貓人士',
    description: '流浪貓受傷需救助',
    type: INCIDENT_TYPES.GENERAL
  },
  {
    id: 5,
    locationName: '九龍公園 (Kowloon Park)',
    position: [22.3000, 114.1700],
    username: '保護者',
    description: '有人虐待流浪狗',
    type: INCIDENT_TYPES.ABUSE
  },
  {
    id: 6,
    locationName: '沙田 (Sha Tin)',
    position: [22.3811, 114.1888],
    username: '熱心人',
    description: '公園內發現毒物',
    type: INCIDENT_TYPES.POISONING
  },
  {
    id: 7,
    locationName: '荃灣 (Tsuen Wan)',
    position: [22.3707, 114.1048],
    username: '狗主',
    description: '流浪狗被拋棄',
    type: INCIDENT_TYPES.GENERAL
  },
  {
    id: 8,
    locationName: '元朗 (Yuen Long)',
    position: [22.4445, 114.0222],
    username: '居民B',
    description: '農田附近有虐待貓行為',
    type: INCIDENT_TYPES.ABUSE
  },
  {
    id: 9,
    locationName: '西貢 (Sai Kung)',
    position: [22.3813, 114.2705],
    username: '行山者',
    description: '發現受傷流浪狗',
    type: INCIDENT_TYPES.GENERAL
  },
  {
    id: 10,
    locationName: '大埔 (Tai Po)',
    position: [22.4480, 114.1642],
    username: '學生',
    description: '工業區內發現毒餌',
    type: INCIDENT_TYPES.POISONING
  },
  {
    id: 11,
    locationName: '觀塘 (Kwun Tong)',
    position: [22.3121, 114.2257],
    username: '義工',
    description: '流浪貓被困需救援',
    type: INCIDENT_TYPES.GENERAL
  },
  {
    id: 12,
    locationName: '深水埗 (Sham Shui Po)',
    position: [22.3307, 114.1622],
    username: '關注者',
    description: '有人虐待街頭動物',
    type: INCIDENT_TYPES.ABUSE
  },
  {
    id: 13,
    locationName: '維多利亞公園 (Victoria Park)',
    position: [22.2820, 114.1902],
    username: '跑步者',
    description: '公園角落有毒物',
    type: INCIDENT_TYPES.POISONING
  },
  {
    id: 14,
    locationName: '油麻地 (Yau Ma Tei)',
    position: [22.3128, 114.1708],
    username: '市民C',
    description: '流浪狗需醫療救助',
    type: INCIDENT_TYPES.GENERAL
  },
  {
    id: 15,
    locationName: '屯門 (Tuen Mun)',
    position: [22.3918, 113.9725],
    username: '愛狗人士',
    description: '發現虐待動物案件',
    type: INCIDENT_TYPES.ABUSE
  },
  {
    id: 16,
    locationName: '北角 (North Point)',
    position: [22.2910, 114.2007],
    username: '街坊',
    description: '後巷有可疑毒物',
    type: INCIDENT_TYPES.POISONING
  },
  {
    id: 17,
    locationName: '大嶼山 (Lantau Island)',
    position: [22.2687, 113.9461],
    username: '村民',
    description: '發現被遺棄的貓',
    type: INCIDENT_TYPES.GENERAL
  },
  {
    id: 18,
    locationName: '將軍澳 (Tseung Kwan O)',
    position: [22.3080, 114.2586],
    username: '家庭',
    description: '有人虐待流浪貓',
    type: INCIDENT_TYPES.ABUSE
  },
  {
    id: 19,
    locationName: '紅磡 (Hung Hom)',
    position: [22.3061, 114.1838],
    username: '工作者',
    description: '碼頭附近有毒餌',
    type: INCIDENT_TYPES.POISONING
  },
  {
    id: 20,
    locationName: '石硤尾 (Shek Kip Mei)',
    position: [22.3330, 114.1668],
    username: '居民D',
    description: '流浪動物聚集需關注',
    type: INCIDENT_TYPES.GENERAL
  }
];

// Heatmap Layer Component
function HeatmapLayer({ data, show }) {
  const map = useMap();
  const heatmapRef = useRef(null);

  useEffect(() => {
    if (show && data.length > 0) {
      const heatData = data.map(pin => [pin.position[0], pin.position[1], 1]);
      heatmapRef.current = L.heatLayer(heatData, { 
        radius: 45,
        blur: 35,
        maxZoom: 13,
        minOpacity: 0.3,
        max: 0.6,
        gradient: {
          0.2: 'rgba(0, 0, 255, 0.5)',
          0.4: 'rgba(0, 255, 255, 0.5)',
          0.6: 'rgba(0, 255, 0, 0.6)',
          0.8: 'rgba(255, 255, 0, 0.7)',
          1.0: 'rgba(255, 0, 0, 0.8)'
        }
      });
      heatmapRef.current.addTo(map);
    }

    return () => {
      if (heatmapRef.current) {
        map.removeLayer(heatmapRef.current);
      }
    };
  }, [show, data, map]);

  return null;
}

// Instagram 嵌入組件
const InstagramEmbed = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // 加載 Instagram 嵌入腳本
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    document.body.appendChild(script);

    // 清理函數
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="instagram-embed-container">
      <div className="row">
        <div className="col-md-12 mb-4">
          <div className="card">
            <div className="card-body">
              <blockquote 
                className="instagram-media" 
                data-instgrm-permalink="https://www.instagram.com/hkanimalnews/?utm_source=ig_embed&amp;utm_campaign=loading" 
                data-instgrm-version="14"
                style={{
                  background: '#FFF',
                  border: '0',
                  borderRadius: '3px',
                  boxShadow: '0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)',
                  margin: '1px',
                  maxWidth: '540px',
                  minWidth: '326px',
                  padding: '0',
                  width: '99.375%'
                }}
                ref={containerRef}
              >
                <div style={{padding: '16px'}}>
                  <a 
                    href="https://www.instagram.com/hkanimalnews/?utm_source=ig_embed&amp;utm_campaign=loading" 
                    style={{
                      background: '#FFFFFF',
                      lineHeight: '0',
                      padding: '0 0',
                      textAlign: 'center',
                      textDecoration: 'none',
                      width: '100%'
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        backgroundColor: '#F4F4F4',
                        borderRadius: '50%',
                        flexGrow: '0',
                        height: '40px',
                        marginRight: '14px',
                        width: '40px'
                      }}></div>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: '1',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          backgroundColor: '#F4F4F4',
                          borderRadius: '4px',
                          flexGrow: '0',
                          height: '14px',
                          marginBottom: '6px',
                          width: '100px'
                        }}></div>
                        <div style={{
                          backgroundColor: '#F4F4F4',
                          borderRadius: '4px',
                          flexGrow: '0',
                          height: '14px',
                          width: '60px'
                        }}></div>
                      </div>
                    </div>
                    <div style={{padding: '19% 0'}}></div>
                    <div style={{
                      display: 'block',
                      height: '50px',
                      margin: '0 auto 12px',
                      width: '50px'
                    }}>
                      <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlnsXlink="https://www.w3.org/1999/xlink">
                        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                          <g transform="translate(-511.000000, -20.000000)" fill="#000000">
                            <g>
                              <path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path>
                            </g>
                          </g>
                        </g>
                      </svg>
                    </div>
                    <div style={{paddingTop: '8px'}}>
                      <div style={{
                        color: '#3897f0',
                        fontFamily: 'Arial,sans-serif',
                        fontSize: '14px',
                        fontStyle: 'normal',
                        fontWeight: '550',
                        lineHeight: '18px'
                      }}>在 Instagram 查看此貼文</div>
                    </div>
                    <div style={{padding: '12.5% 0'}}></div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'row',
                      marginBottom: '14px',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{
                          backgroundColor: '#F4F4F4',
                          borderRadius: '50%',
                          height: '12.5px',
                          width: '12.5px',
                          transform: 'translateX(0px) translateY(7px)'
                        }}></div>
                        <div style={{
                          backgroundColor: '#F4F4F4',
                          height: '12.5px',
                          transform: 'rotate(-45deg) translateX(3px) translateY(1px)',
                          width: '12.5px',
                          flexGrow: '0',
                          marginRight: '14px',
                          marginLeft: '2px'
                        }}></div>
                        <div style={{
                          backgroundColor: '#F4F4F4',
                          borderRadius: '50%',
                          height: '12.5px',
                          width: '12.5px',
                          transform: 'translateX(9px) translateY(-18px)'
                        }}></div>
                      </div>
                      <div style={{marginLeft: '8px'}}>
                        <div style={{
                          backgroundColor: '#F4F4F4',
                          borderRadius: '50%',
                          flexGrow: '0',
                          height: '20px',
                          width: '20px'
                        }}></div>
                        <div style={{
                          width: '0',
                          height: '0',
                          borderTop: '2px solid transparent',
                          borderLeft: '6px solid #f4f4f4',
                          borderBottom: '2px solid transparent',
                          transform: 'translateX(16px) translateY(-4px) rotate(30deg)'
                        }}></div>
                      </div>
                      <div style={{marginLeft: 'auto'}}>
                        <div style={{
                          width: '0px',
                          borderTop: '8px solid #F4F4F4',
                          borderRight: '8px solid transparent',
                          transform: 'translateY(16px)'
                        }}></div>
                        <div style={{
                          backgroundColor: '#F4F4F4',
                          flexGrow: '0',
                          height: '12px',
                          width: '16px',
                          transform: 'translateY(-4px)'
                        }}></div>
                        <div style={{
                          width: '0',
                          height: '0',
                          borderTop: '8px solid #F4F4F4',
                          borderLeft: '8px solid transparent',
                          transform: 'translateY(-4px) translateX(8px)'
                        }}></div>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      flexGrow: '1',
                      justifyContent: 'center',
                      marginBottom: '24px'
                    }}>
                      <div style={{
                        backgroundColor: '#F4F4F4',
                        borderRadius: '4px',
                        flexGrow: '0',
                        height: '14px',
                        marginBottom: '6px',
                        width: '224px'
                      }}></div>
                      <div style={{
                        backgroundColor: '#F4F4F4',
                        borderRadius: '4px',
                        flexGrow: '0',
                        height: '14px',
                        width: '144px'
                      }}></div>
                    </div>
                  </a>
                  <p style={{
                    color: '#c9c8cd',
                    fontFamily: 'Arial,sans-serif',
                    fontSize: '14px',
                    lineHeight: '17px',
                    marginBottom: '0',
                    marginTop: '8px',
                    overflow: 'hidden',
                    padding: '8px 0 7px',
                    textAlign: 'center',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    <a
                      href="https://www.instagram.com/hkanimalnews/?utm_source=ig_embed&amp;utm_campaign=loading"
                      style={{
                        color: '#c9c8cd',
                        fontFamily: 'Arial,sans-serif',
                        fontSize: '14px',
                        fontStyle: 'normal',
                        fontWeight: 'normal',
                        lineHeight: '17px'
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >香港動物報 HANIMALNEWS</a>(@hkanimalnews) 分享的帖子
                  </p>
                </div>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Facebook 嵌入組件
const FacebookEmbed = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // 加載 Facebook SDK
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/zh_HK/sdk.js#xfbml=1&version=v19.0';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    document.body.appendChild(script);

    // 清理函數
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="facebook-embed-container">
      <div className="card">
        <div className="card-body">
          <div 
            className="fb-page" 
            data-href="https://www.facebook.com/NPVHK" 
            data-tabs="timeline" 
            data-width="500" 
            data-height="600" 
            data-small-header="false" 
            data-adapt-container-width="true" 
            data-hide-cover="false" 
            data-show-facepile="true"
            ref={containerRef}
          >
            <blockquote cite="https://www.facebook.com/NPVHK" className="fb-xfbml-parse-ignore">
              <a href="https://www.facebook.com/NPVHK">愛護動物協會 SPCA (HK)</a>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
};

// 地址搜索組件
const LocationSearch = ({ onSelectLocation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 使用 Nominatim OpenStreetMap API 進行地理編碼
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm + ', Hong Kong')}&limit=5&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('搜索請求失敗');
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('地址搜索錯誤:', err);
      setError('搜索時出錯，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectLocation = (location) => {
    onSelectLocation({
      name: location.display_name.split(',')[0],
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon)
    });
    setSearchResults([]);
    setSearchTerm('');
  };

  return (
    <div className="location-search mb-4">
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="搜索香港地址"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button 
          className="btn btn-outline-primary" 
          type="button" 
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          ) : '搜索'}
        </button>
      </div>
      
      {error && <div className="alert alert-danger mt-2">{error}</div>}
      
      {searchResults.length > 0 && (
        <div className="mt-2 search-results-container" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
          <div className="list-group list-group-flush">
            {searchResults.map((result, index) => (
              <button
                key={index}
                type="button"
                className="list-group-item list-group-item-action"
                onClick={() => handleSelectLocation(result)}
              >
                {result.display_name}
                <small className="d-block text-muted">
                  緯度: {parseFloat(result.lat).toFixed(4)}, 經度: {parseFloat(result.lon).toFixed(4)}
                </small>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  const [pins, setPins] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    description: '',
    type: INCIDENT_TYPES.GENERAL,
    locationName: '',
    latitude: '',
    longitude: '',
    contactInfo: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState('');

  // 初始化本地存儲
  useEffect(() => {
    const storedPins = JSON.parse(localStorage.getItem('pins'));
    if (!storedPins || storedPins.length === 0) {
      localStorage.setItem('pins', JSON.stringify(mockData));
      setPins(mockData);
    } else {
      setPins(storedPins);
    }
  }, []);

  // 保存 pins 到本地存儲
  useEffect(() => {
    localStorage.setItem('pins', JSON.stringify(pins));
  }, [pins]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.username || !formData.description || !formData.locationName || 
        !formData.latitude || !formData.longitude) {
      alert('請填寫所有必填欄位');
      return;
    }

    // Validate latitude and longitude
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    
    if (isNaN(lat) || isNaN(lng) || lat < 22.1 || lat > 22.6 || lng < 113.8 || lng > 114.5) {
      alert('請輸入有效的香港座標 (緯度: 22.1-22.6, 經度: 113.8-114.5)');
      return;
    }

    // Create new pin
    const newPin = {
      id: Date.now(),
      locationName: formData.locationName,
      position: [lat, lng],
      username: formData.username,
      description: formData.description,
      type: formData.type,
      contactInfo: formData.contactInfo,
      imageUrl: imagePreview // Store the image preview URL if available
    };

    console.log('Adding new pin:', newPin);
    setPins(prevPins => [...prevPins, newPin]);
    
    // Reset form
    setFormData({
      username: '',
      description: '',
      type: INCIDENT_TYPES.GENERAL,
      locationName: '',
      latitude: '',
      longitude: '',
      contactInfo: '',
      image: null
    });
    setImagePreview('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({...formData, image: file});
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSelect = (location) => {
    setFormData({
      ...formData,
      locationName: location.name,
      latitude: location.lat.toString(),
      longitude: location.lng.toString()
    });
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">🐾 香港寵物保護地圖 🐾</h1>
      
      {/* 添加新地點 - Moved to top of the page */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">📍 添加新地點</h5>
              
              {/* 地址搜索工具 */}
              <div className="address-search-section mb-3">
                <h6>🔍 不知道確切座標？</h6>
                <p className="small text-muted">搜索香港地址來獲取座標</p>
                <LocationSearch onSelectLocation={handleLocationSelect} />
              </div>
              
              <form onSubmit={handleFormSubmit}>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">📌 地點名稱</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.locationName}
                      onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                      placeholder="請輸入地點名稱"
                      required
                    />
                  </div>
                  
                  <div className="col-md-2 mb-3">
                    <label className="form-label">🌐 緯度</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="例如: 22.3193"
                      required
                    />
                  </div>
                  
                  <div className="col-md-2 mb-3">
                    <label className="form-label">🌐 經度</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="例如: 114.1694"
                      required
                    />
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <label className="form-label">👤 用戶名</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="請輸入用戶名"
                      required
                    />
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">📞 聯絡方式</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.contactInfo}
                      onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                      placeholder="請輸入電話或電郵"
                      required
                    />
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <label className="form-label">🏷️ 事件類型</label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      {Object.values(INCIDENT_TYPES).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <label className="form-label">📷 上傳照片</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-8 mb-3">
                    <label className="form-label">📝 描述</label>
                    <textarea
                      className="form-control"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="請輸入事件描述"
                      required
                      rows="2"
                    />
                  </div>
                  
                  <div className="col-md-4 mb-3 d-flex align-items-end">
                    {imagePreview ? (
                      <div className="d-flex justify-content-between w-100">
                        <img 
                          src={imagePreview} 
                          alt="預覽" 
                          style={{ maxWidth: '100px', maxHeight: '60px' }} 
                          className="border rounded" 
                        />
                        <button type="submit" className="btn btn-primary">添加地點</button>
                      </div>
                    ) : (
                      <button type="submit" className="btn btn-primary w-100">添加地點</button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Map and Location List - side by side */}
      <div className="row">
        <div className="col-md-8">
          <div className="map-container">
            <MapContainer
              center={[22.3193, 114.1694]}
              zoom={11}
              style={{ height: '500px', width: '100%' }}
            >
              <TileLayer
                url="/tiles/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <HeatmapLayer data={pins} show={showHeatmap} />
              {pins.map(pin => (
                <Marker key={pin.id} position={pin.position}>
                  <Popup>
                    <div>
                      <strong>📍 地點:</strong> {pin.locationName || '未命名地點'}<br />
                      <strong>👤 用戶:</strong> {pin.username}<br />
                      <strong>📝 描述:</strong> {pin.description}<br />
                      <strong>🏷️ 類型:</strong> {pin.type}<br />
                      <strong>🌐 座標:</strong> {pin.position[0].toFixed(4)}, {pin.position[1].toFixed(4)}
                      {pin.imageUrl && (
                        <div className="mt-2">
                          <img 
                            src={pin.imageUrl} 
                            alt="事件照片" 
                            style={{ maxWidth: '100%', maxHeight: '150px' }} 
                          />
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">📋 地點列表</h5>
              <div className="mb-3">
                <button 
                  className={`btn ${showHeatmap ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => setShowHeatmap(!showHeatmap)}
                >
                  {showHeatmap ? '🔍 隱藏熱力圖' : '🔥 顯示熱力圖'}
                </button>
              </div>
              <div 
                className="pin-list-container flex-grow-1" 
                style={{ 
                  height: "420px", 
                  overflowY: "auto", 
                  border: "1px solid #eee", 
                  borderRadius: "4px" 
                }}
              >
                <ul className="list-group list-group-flush">
                  {pins.map(pin => (
                    <li key={pin.id} className="list-group-item">
                      <strong>{pin.locationName || '未命名地點'}</strong> - {pin.username}<br />
                      {pin.description}<br />
                      <small>類型: {pin.type}</small><br />
                      <small>緯度: {pin.position[0].toFixed(4)}, 經度: {pin.position[1].toFixed(4)}</small>
                      {pin.imageUrl && (
                        <div className="mt-1">
                          <img 
                            src={pin.imageUrl} 
                            alt="事件照片" 
                            style={{ maxWidth: '80px', maxHeight: '60px' }} 
                            className="rounded" 
                          />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="row mt-5 mb-5">
        <div className="col-12">
          <h3 className="text-center mb-4">📰 最新動物資訊</h3>
        </div>
        <div className="col-md-6">
          <InstagramEmbed />
        </div>
        <div className="col-md-6">
          <FacebookEmbed />
        </div>
      </div>
    </div>
  );
}

export default App; 