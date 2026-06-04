import React from 'react'

const PIN = (cx, cy) =>
  `<circle cx="${cx}" cy="${cy}" r="4" fill="#6366f1" stroke="#fff" strokeWidth="1.5"/>`

function makeBoxSVG({ fill, stroke, icon, fontSize = 11, bold = true }) {
  return function BoxSVG({ w, h, label, value }) {
    const cx = w / 2, cy = h / 2
    return (
      <svg width={w} height={h} style={{ overflow: 'visible' }}>
        <rect x="4" y="4" width={w} height={h} rx="10" fill="rgba(0,0,0,0.15)" />
        <rect x="0" y="0" width={w} height={h} rx="10" fill={fill} stroke={stroke} strokeWidth="1.8" />
        {icon && <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20">{icon}</text>}
        <text x={cx} y={cy + (icon ? 14 : 5)} textAnchor="middle"
          fontSize={value && (value.length > 12) ? fontSize - 1 : fontSize} fontWeight={bold ? '700' : '400'}
          fill={stroke} fontFamily="monospace">{value || label}</text>
        <text x={cx} y={-10} textAnchor="middle" fontSize="10" fontWeight="700"
          fill="#1e293b" fontFamily="monospace">{label}</text>
        <circle cx={cx} cy="0" r="4" fill="#6366f1" stroke="#fff" strokeWidth="1.5"/>
        <circle cx={cx} cy={h} r="4" fill="#6366f1" stroke="#fff" strokeWidth="1.5"/>
        <circle cx="0" cy={cy} r="4" fill="#6366f1" stroke="#fff" strokeWidth="1.5"/>
        <circle cx={w} cy={cy} r="4" fill="#6366f1" stroke="#fff" strokeWidth="1.5"/>
      </svg>
    )
  }
}

function makeCylinderSVG({ fill, stroke, icon }) {
  return function CylinderSVG({ w, h, label, value }) {
    const cx = w / 2, ry = 10
    return (
      <svg width={w} height={h} style={{ overflow: 'visible' }}>
        <rect x="4" y="4" width={w} height={h} rx="6" fill="rgba(0,0,0,0.12)" />
        <rect x="0" y={ry} width={w} height={h - ry * 2} fill={fill} stroke={stroke} strokeWidth="1.8" />
        <ellipse cx={cx} cy={ry} rx={cx} ry={ry} fill={fill} stroke={stroke} strokeWidth="1.8"/>
        <ellipse cx={cx} cy={h - ry} rx={cx} ry={ry} fill={fill} stroke={stroke} strokeWidth="1.8"/>
        <ellipse cx={cx} cy={ry} rx={cx - 1} ry={ry - 1} fill={fill}/>
        {icon && <text x={cx} y={h/2 - 4} textAnchor="middle" fontSize="18">{icon}</text>}
        <text x={cx} y={h/2 + 14} textAnchor="middle" fontSize={value && (value.length > 12) ? 9 : 10} fontWeight="700" fill={stroke} fontFamily="monospace">{value || label}</text>
        <text x={cx} y={-10} textAnchor="middle" fontSize="10" fontWeight="700" fill="#1e293b" fontFamily="monospace">{label}</text>
        <circle cx={cx} cy="0" r="4" fill="#6366f1" stroke="#fff" strokeWidth="1.5"/>
        <circle cx={cx} cy={h} r="4" fill="#6366f1" stroke="#fff" strokeWidth="1.5"/>
        <circle cx="0" cy={h/2} r="4" fill="#6366f1" stroke="#fff" strokeWidth="1.5"/>
        <circle cx={w} cy={h/2} r="4" fill="#6366f1" stroke="#fff" strokeWidth="1.5"/>
      </svg>
    )
  }
}

function makeCloudSVG({ fill, stroke, icon }) {
  return function CloudSVG({ w, h, label, value }) {
    const cx = w / 2, cy = h / 2 + 5
    const p = `M ${w*0.25},${cy+10}
      a${w*0.18},${h*0.28} 0 0,1 ${w*0.04}-${h*0.42}
      a${w*0.16},${h*0.26} 0 0,1 ${w*0.27}-${h*0.04}
      a${w*0.14},${h*0.22} 0 0,1 ${w*0.26},${h*0.04}
      a${w*0.16},${h*0.28} 0 0,1 ${w*0.12},${h*0.42}
      Z`
    return (
      <svg width={w} height={h} style={{ overflow: 'visible' }}>
        <path d={p} fill={fill} stroke={stroke} strokeWidth="1.8"/>
        {icon && <text x={cx} y={cy - 4} textAnchor="middle" fontSize="20">{icon}</text>}
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize="10" fontWeight="700" fill={stroke} fontFamily="monospace">{value || label}</text>
        <text x={cx} y={-8} textAnchor="middle" fontSize="10" fontWeight="700" fill="#1e293b" fontFamily="monospace">{label}</text>
        <circle cx={cx} cy="0" r="4" fill="#6366f1" stroke="#fff" strokeWidth="1.5"/>
        <circle cx={cx} cy={h} r="4" fill="#6366f1" stroke="#fff" strokeWidth="1.5"/>
        <circle cx="8" cy={cy} r="4" fill="#6366f1" stroke="#fff" strokeWidth="1.5"/>
        <circle cx={w - 8} cy={cy} r="4" fill="#6366f1" stroke="#fff" strokeWidth="1.5"/>
      </svg>
    )
  }
}

function makeArrowSVG({ fill, stroke }) {
  return function ArrowSVG({ w, h, label, value }) {
    const cy = h / 2
    return (
      <svg width={w} height={h} style={{ overflow: 'visible' }}>
        <line x1="0" y1={cy} x2={w - 14} y2={cy} stroke={stroke} strokeWidth="2.5" strokeLinecap="round"/>
        <polygon points={`${w-14},${cy-8} ${w},${cy} ${w-14},${cy+8}`} fill={stroke}/>
        {value && <text x={w/2} y={cy - 8} textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="monospace">{value}</text>}
        <text x={w/2} y={cy + 18} textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="monospace">{label}</text>
      </svg>
    )
  }
}

function makeDecisionSVG({ fill, stroke }) {
  return function DecisionSVG({ w, h, label, value }) {
    const cx = w / 2, cy = h / 2
    const pts = `${cx},0 ${w},${cy} ${cx},${h} 0,${cy}`
    return (
      <svg width={w} height={h} style={{ overflow: 'visible' }}>
        <polygon points={pts} fill={fill} stroke={stroke} strokeWidth="1.8"/>
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={stroke} fontFamily="monospace">{value || '?'}</text>
        <text x={cx} y={-10} textAnchor="middle" fontSize="10" fontWeight="700" fill="#1e293b" fontFamily="monospace">{label}</text>
        <circle cx={cx} cy="0" r="4" fill="#6366f1" stroke="#fff" strokeWidth="1.5"/>
        <circle cx={cx} cy={h} r="4" fill="#6366f1" stroke="#fff" strokeWidth="1.5"/>
        <circle cx="0" cy={cy} r="4" fill="#6366f1" stroke="#fff" strokeWidth="1.5"/>
        <circle cx={w} cy={cy} r="4" fill="#6366f1" stroke="#fff" strokeWidth="1.5"/>
      </svg>
    )
  }
}

function makeQueueSVG({ fill, stroke, icon }) {
  return function QueueSVG({ w, h, label, value }) {
    const cx = w / 2, cy = h / 2
    return (
      <svg width={w} height={h} style={{ overflow: 'visible' }}>
        <rect x="4" y="4" width={w} height={h} rx="4" fill="rgba(0,0,0,0.1)"/>
        <rect x="0" y="0" width={w} height={h} rx="4" fill={fill} stroke={stroke} strokeWidth="1.8"/>
        {[0.28, 0.5, 0.72].map((frac, i) => (
          <rect key={i} x={w*frac - 6} y={h*0.25} width="12" height={h*0.5} rx="3" fill={stroke} opacity="0.6"/>
        ))}
        {icon && <text x={cx} y={cy - 4} textAnchor="middle" fontSize="16">{icon}</text>}
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize="9" fontWeight="700" fill={stroke} fontFamily="monospace">{value || label}</text>
        <text x={cx} y={-10} textAnchor="middle" fontSize="10" fontWeight="700" fill="#1e293b" fontFamily="monospace">{label}</text>
        <circle cx={cx} cy="0" r="4" fill="#6366f1" stroke="#fff" strokeWidth="1.5"/>
        <circle cx={cx} cy={h} r="4" fill="#6366f1" stroke="#fff" strokeWidth="1.5"/>
        <circle cx="0" cy={cy} r="4" fill="#6366f1" stroke="#fff" strokeWidth="1.5"/>
        <circle cx={w} cy={cy} r="4" fill="#6366f1" stroke="#fff" strokeWidth="1.5"/>
      </svg>
    )
  }
}

export const CS_DEFS = {
  cs_user: { label: 'User / Client', cat: 'CS: Clients', prefix: 'USR', val: 'Browser', w: 140, h: 90, icon: '👤', desc: 'End user or client application', Svg: makeBoxSVG({ fill: '#eff6ff', stroke: '#2563eb', icon: '👤', fontSize: 10 }) },
  cs_browser: { label: 'Web Browser', cat: 'CS: Clients', prefix: 'BR', val: 'Chrome/Firefox', w: 150, h: 90, icon: '🌐', desc: 'Web browser client', Svg: makeBoxSVG({ fill: '#f0fdf4', stroke: '#16a34a', icon: '🌐', fontSize: 10 }) },
  cs_mobile: { label: 'Mobile App', cat: 'CS: Clients', prefix: 'MOB', val: 'iOS/Android', w: 140, h: 90, icon: '📱', desc: 'Mobile application client', Svg: makeBoxSVG({ fill: '#fff7ed', stroke: '#ea580c', icon: '📱', fontSize: 10 }) },
  cs_iot: { label: 'IoT Device', cat: 'CS: Clients', prefix: 'IOT', val: 'MQTT', w: 140, h: 90, icon: '📡', desc: 'IoT sensor or embedded device', Svg: makeBoxSVG({ fill: '#fdf4ff', stroke: '#9333ea', icon: '📡', fontSize: 10 }) },
  cs_server: { label: 'Server', cat: 'CS: Servers', prefix: 'SRV', val: 'Node.js', w: 150, h: 90, icon: '🖥️', desc: 'Application or web server', Svg: makeBoxSVG({ fill: '#1e293b', stroke: '#6366f1', icon: '🖥️', fontSize: 10 }) },
  cs_api: { label: 'REST API', cat: 'CS: Servers', prefix: 'API', val: 'HTTP/JSON', w: 150, h: 90, icon: '⚡', desc: 'REST or GraphQL API endpoint', Svg: makeBoxSVG({ fill: '#1e1b4b', stroke: '#818cf8', icon: '⚡', fontSize: 10 }) },
  cs_auth_server: { label: 'Auth Server', cat: 'CS: Servers', prefix: 'AUTH', val: 'OAuth2/JWT', w: 160, h: 90, icon: '🔐', desc: 'Authentication & authorization server', Svg: makeBoxSVG({ fill: '#fef2f2', stroke: '#dc2626', icon: '🔐', fontSize: 10 }) },
  cs_microservice: { label: 'Microservice', cat: 'CS: Servers', prefix: 'SVC', val: 'gRPC', w: 155, h: 90, icon: '🧩', desc: 'Independent microservice', Svg: makeBoxSVG({ fill: '#f0fdf4', stroke: '#059669', icon: '🧩', fontSize: 10 }) },
  cs_gateway: { label: 'API Gateway', cat: 'CS: Servers', prefix: 'GW', val: 'NGINX/Kong', w: 155, h: 90, icon: '🚪', desc: 'API gateway / reverse proxy', Svg: makeBoxSVG({ fill: '#fef3c7', stroke: '#d97706', icon: '🚪', fontSize: 10 }) },
  cs_lb: { label: 'Load Balancer', cat: 'CS: Servers', prefix: 'LB', val: 'Round-robin', w: 160, h: 90, icon: '⚖️', desc: 'Distributes traffic across instances', Svg: makeBoxSVG({ fill: '#ecfdf5', stroke: '#10b981', icon: '⚖️', fontSize: 10 }) },
  cs_cdn: { label: 'CDN', cat: 'CS: Servers', prefix: 'CDN', val: 'CloudFront', w: 140, h: 90, icon: '🌍', desc: 'Content Delivery Network', Svg: makeBoxSVG({ fill: '#f0f9ff', stroke: '#0284c7', icon: '🌍', fontSize: 10 }) },
  cs_webhook: { label: 'Webhook', cat: 'CS: Servers', prefix: 'WH', val: 'POST callback', w: 150, h: 90, icon: '🪝', desc: 'HTTP webhook callback endpoint', Svg: makeBoxSVG({ fill: '#fff7ed', stroke: '#c2410c', icon: '🪝', fontSize: 10 }) },
  cs_database: { label: 'Database', cat: 'CS: Storage', prefix: 'DB', val: 'PostgreSQL', w: 140, h: 90, icon: '🗄️', desc: 'Relational SQL database', Svg: makeCylinderSVG({ fill: '#eff6ff', stroke: '#1d4ed8', icon: '🗄️' }) },
  cs_nosql: { label: 'NoSQL DB', cat: 'CS: Storage', prefix: 'NS', val: 'MongoDB', w: 140, h: 90, icon: '🍃', desc: 'Non-relational NoSQL database', Svg: makeCylinderSVG({ fill: '#f0fdf4', stroke: '#15803d', icon: '🍃' }) },
  cs_redis: { label: 'Cache / Redis', cat: 'CS: Storage', prefix: 'RDS', val: 'Redis', w: 140, h: 90, icon: '⚡', desc: 'In-memory cache store', Svg: makeCylinderSVG({ fill: '#fef2f2', stroke: '#dc2626', icon: '⚡' }) },
  cs_blob: { label: 'Blob Storage', cat: 'CS: Storage', prefix: 'S3', val: 'S3/GCS', w: 140, h: 90, icon: '🪣', desc: 'Object / blob storage', Svg: makeCylinderSVG({ fill: '#fff7ed', stroke: '#ea580c', icon: '🪣' }) },
  cs_search: { label: 'Search Engine', cat: 'CS: Storage', prefix: 'ES', val: 'Elasticsearch', w: 150, h: 90, icon: '🔍', desc: 'Full-text search service', Svg: makeCylinderSVG({ fill: '#fdf4ff', stroke: '#a21caf', icon: '🔍' }) },
  cs_data_warehouse: { label: 'Data Warehouse', cat: 'CS: Storage', prefix: 'DW', val: 'BigQuery', w: 155, h: 90, icon: '🏭', desc: 'Analytics data warehouse', Svg: makeCylinderSVG({ fill: '#f0f9ff', stroke: '#0369a1', icon: '🏭' }) },
  cs_queue: { label: 'Message Queue', cat: 'CS: Messaging', prefix: 'MQ', val: 'RabbitMQ', w: 155, h: 90, icon: '📨', desc: 'Async message queue broker', Svg: makeQueueSVG({ fill: '#fff7ed', stroke: '#d97706', icon: '📨' }) },
  cs_kafka: { label: 'Kafka Topic', cat: 'CS: Messaging', prefix: 'KF', val: 'Apache Kafka', w: 155, h: 90, icon: '🌊', desc: 'Event streaming platform', Svg: makeQueueSVG({ fill: '#1e1b4b', stroke: '#818cf8', icon: '🌊' }) },
  cs_pubsub: { label: 'Pub/Sub', cat: 'CS: Messaging', prefix: 'PS', val: 'Pub/Sub', w: 140, h: 90, icon: '📢', desc: 'Publish-subscribe messaging', Svg: makeQueueSVG({ fill: '#f0fdf4', stroke: '#16a34a', icon: '📢' }) },
  cs_jwt: { label: 'JWT Token', cat: 'CS: Auth', prefix: 'JWT', val: 'HS256', w: 140, h: 90, icon: '🎫', desc: 'JSON Web Token (signed)', Svg: makeBoxSVG({ fill: '#fefce8', stroke: '#ca8a04', icon: '🎫', fontSize: 10 }) },
  cs_oauth: { label: 'OAuth 2.0', cat: 'CS: Auth', prefix: 'OA', val: 'Authorization', w: 150, h: 90, icon: '🔑', desc: 'OAuth 2.0 authorization flow', Svg: makeBoxSVG({ fill: '#fef2f2', stroke: '#b91c1c', icon: '🔑', fontSize: 10 }) },
  cs_session: { label: 'Session Store', cat: 'CS: Auth', prefix: 'SS', val: 'Cookie/Redis', w: 150, h: 90, icon: '🍪', desc: 'Server-side session storage', Svg: makeBoxSVG({ fill: '#fff7ed', stroke: '#c2410c', icon: '🍪', fontSize: 10 }) },
  cs_firewall: { label: 'Firewall / WAF', cat: 'CS: Auth', prefix: 'FW', val: 'WAF', w: 150, h: 90, icon: '🛡️', desc: 'Web application firewall', Svg: makeBoxSVG({ fill: '#fef2f2', stroke: '#991b1b', icon: '🛡️', fontSize: 10 }) },
  cs_mfa: { label: 'MFA / 2FA', cat: 'CS: Auth', prefix: 'MFA', val: 'TOTP/SMS', w: 140, h: 90, icon: '📲', desc: 'Multi-factor authentication', Svg: makeBoxSVG({ fill: '#fdf4ff', stroke: '#7c3aed', icon: '📲', fontSize: 10 }) },
  cs_ldap: { label: 'LDAP / AD', cat: 'CS: Auth', prefix: 'DIR', val: 'Active Directory', w: 150, h: 90, icon: '🏢', desc: 'Directory service (LDAP/Active Directory)', Svg: makeBoxSVG({ fill: '#eff6ff', stroke: '#1d4ed8', icon: '🏢', fontSize: 10 }) },
  cs_cloud: { label: 'Cloud', cat: 'CS: Cloud', prefix: 'CLD', val: 'AWS/GCP/Azure', w: 160, h: 100, icon: '☁️', desc: 'Cloud infrastructure provider', Svg: makeCloudSVG({ fill: '#f0f9ff', stroke: '#0284c7', icon: '☁️' }) },
  cs_k8s: { label: 'Kubernetes', cat: 'CS: Cloud', prefix: 'K8S', val: 'Pod/Cluster', w: 155, h: 90, icon: '☸️', desc: 'Container orchestration cluster', Svg: makeBoxSVG({ fill: '#eff6ff', stroke: '#2563eb', icon: '☸️', fontSize: 10 }) },
  cs_docker: { label: 'Docker', cat: 'CS: Cloud', prefix: 'DCK', val: 'Container', w: 140, h: 90, icon: '🐳', desc: 'Docker container', Svg: makeBoxSVG({ fill: '#f0f9ff', stroke: '#0369a1', icon: '🐳', fontSize: 10 }) },
  cs_lambda: { label: 'Serverless Fn', cat: 'CS: Cloud', prefix: 'FN', val: 'Lambda/CF', w: 155, h: 90, icon: '⚡', desc: 'Serverless function (Lambda/Cloud Functions)', Svg: makeBoxSVG({ fill: '#fff7ed', stroke: '#b45309', icon: '⚡', fontSize: 10 }) },
  cs_internet: { label: 'Internet', cat: 'CS: Cloud', prefix: 'NET', val: 'TCP/IP', w: 155, h: 100, icon: '🌐', desc: 'Public internet network', Svg: makeCloudSVG({ fill: '#f0fdf4', stroke: '#16a34a', icon: '🌐' }) },
  cs_process: { label: 'Process', cat: 'CS: Flow', prefix: 'P', val: 'Step', w: 150, h: 70, icon: null, desc: 'Processing step or function', Svg: makeBoxSVG({ fill: '#f8fafc', stroke: '#475569', icon: null, fontSize: 11, bold: false }) },
  cs_decision: { label: 'Decision', cat: 'CS: Flow', prefix: 'D', val: 'Yes/No', w: 130, h: 80, icon: null, desc: 'Conditional decision / branch', Svg: makeDecisionSVG({ fill: '#fefce8', stroke: '#ca8a04' }) },
  cs_flow_arrow: { label: 'Arrow', cat: 'CS: Flow', prefix: 'ARR', val: '', w: 120, h: 40, icon: null, desc: 'Flow connection arrow', Svg: makeArrowSVG({ fill: '#6366f1', stroke: '#6366f1' }) },
  cs_start: { label: 'Start', cat: 'CS: Flow', prefix: 'ST', val: 'Start', w: 110, h: 60, icon: null, desc: 'Flow start point', Svg: makeBoxSVG({ fill: '#dcfce7', stroke: '#16a34a', icon: null, fontSize: 12, bold: true }) },
  cs_end: { label: 'End', cat: 'CS: Flow', prefix: 'END', val: 'End', w: 110, h: 60, icon: null, desc: 'Flow end / terminal', Svg: makeBoxSVG({ fill: '#fee2e2', stroke: '#dc2626', icon: null, fontSize: 12, bold: true }) },
  cs_monitor: { label: 'Monitoring', cat: 'CS: DevOps', prefix: 'MON', val: 'Prometheus', w: 150, h: 90, icon: '📊', desc: 'Metrics & monitoring system', Svg: makeBoxSVG({ fill: '#f0fdf4', stroke: '#15803d', icon: '📊', fontSize: 10 }) },
  cs_logger: { label: 'Logging', cat: 'CS: DevOps', prefix: 'LOG', val: 'ELK Stack', w: 140, h: 90, icon: '📜', desc: 'Centralized log aggregation', Svg: makeBoxSVG({ fill: '#fefce8', stroke: '#a16207', icon: '📜', fontSize: 10 }) },
  cs_ci_cd: { label: 'CI/CD Pipeline', cat: 'CS: DevOps', prefix: 'CI', val: 'GitHub Actions', w: 160, h: 90, icon: '🔄', desc: 'Continuous integration & deployment', Svg: makeBoxSVG({ fill: '#fdf4ff', stroke: '#9333ea', icon: '🔄', fontSize: 10 }) },
}

export const CS_TEMPLATES = {
  auth_service: {
    title: 'Authentication Service Flow',
    keywords: ['auth', 'authentication', 'login', 'signin', 'sign in', 'logout', 'oauth', 'jwt', 'session', 'access control', 'sso', 'saml', 'authentication service', 'auth service', 'auth diagram', 'authentication flow', 'login flow', 'auth system'],
    components: [
      { type: 'cs_user', label: 'Client', value: 'Browser', x: 60, y: 250 },
      { type: 'cs_firewall', label: 'WAF', value: 'WAF/HTTPS', x: 260, y: 250 },
      { type: 'cs_gateway', label: 'GW1', value: 'API Gateway', x: 460, y: 250 },
      { type: 'cs_auth_server', label: 'AUTH', value: 'Auth Server', x: 660, y: 140 },
      { type: 'cs_jwt', label: 'TKN', value: 'JWT Token', x: 860, y: 140 },
      { type: 'cs_mfa', label: 'MFA1', value: 'TOTP/SMS', x: 660, y: 360 },
      { type: 'cs_database', label: 'UserDB', value: 'Users DB', x: 860, y: 360 },
      { type: 'cs_redis', label: 'CACHE', value: 'Session Cache', x: 860, y: 510 },
      { type: 'cs_session', label: 'SESS', value: 'Session Store', x: 1060, y: 250 },
      { type: 'cs_server', label: 'APP', value: 'App Server', x: 1060, y: 440 },
      { type: 'cs_logger', label: 'LOG', value: 'Auth Logs', x: 460, y: 470 },
    ]
  },
  api_architecture: {
    title: 'REST API Architecture',
    keywords: ['api', 'rest api', 'api architecture', 'backend', 'web api', 'api design', 'microservices', 'service architecture'],
    components: [
      { type: 'cs_browser', label: 'Web', value: 'React App', x: 60, y: 180 },
      { type: 'cs_mobile', label: 'App', value: 'Mobile', x: 60, y: 340 },
      { type: 'cs_cdn', label: 'CDN', value: 'CloudFront', x: 60, y: 490 },
      { type: 'cs_lb', label: 'LB', value: 'Load Balancer', x: 280, y: 280 },
      { type: 'cs_gateway', label: 'GW', value: 'API Gateway', x: 460, y: 280 },
      { type: 'cs_api', label: 'API1', value: 'User Service', x: 660, y: 160 },
      { type: 'cs_api', label: 'API2', value: 'Auth Service', x: 660, y: 300 },
      { type: 'cs_api', label: 'API3', value: 'Data Service', x: 660, y: 440 },
      { type: 'cs_database', label: 'DB', value: 'PostgreSQL', x: 880, y: 220 },
      { type: 'cs_redis', label: 'CACHE', value: 'Redis Cache', x: 880, y: 380 },
      { type: 'cs_queue', label: 'MQ', value: 'RabbitMQ', x: 880, y: 510 },
      { type: 'cs_monitor', label: 'MON', value: 'Prometheus', x: 460, y: 510 },
    ]
  },
  microservices: {
    title: 'Microservices Architecture',
    keywords: ['microservice', 'microservices', 'micro service', 'service mesh', 'distributed system', 'distributed architecture'],
    components: [
      { type: 'cs_internet', label: 'NET', value: 'Internet', x: 60, y: 280 },
      { type: 'cs_gateway', label: 'GW', value: 'API Gateway', x: 260, y: 280 },
      { type: 'cs_microservice', label: 'SVC1', value: 'User Svc', x: 480, y: 120 },
      { type: 'cs_microservice', label: 'SVC2', value: 'Auth Svc', x: 480, y: 260 },
      { type: 'cs_microservice', label: 'SVC3', value: 'Order Svc', x: 480, y: 400 },
      { type: 'cs_microservice', label: 'SVC4', value: 'Notify Svc', x: 480, y: 540 },
      { type: 'cs_kafka', label: 'BUS', value: 'Event Bus', x: 700, y: 320 },
      { type: 'cs_database', label: 'DB1', value: 'Users DB', x: 920, y: 120 },
      { type: 'cs_database', label: 'DB2', value: 'Orders DB', x: 920, y: 320 },
      { type: 'cs_nosql', label: 'DB3', value: 'Notify DB', x: 920, y: 520 },
      { type: 'cs_k8s', label: 'K8S', value: 'K8s Cluster', x: 700, y: 560 },
    ]
  },
  ci_cd_pipeline: {
    title: 'CI/CD Pipeline',
    keywords: ['ci cd', 'cicd', 'pipeline', 'devops', 'deployment', 'deploy', 'github actions', 'jenkins', 'continuous integration', 'continuous deployment'],
    components: [
      { type: 'cs_user', label: 'DEV', value: 'Developer', x: 60, y: 280 },
      { type: 'cs_process', label: 'GIT', value: 'Git Push', x: 250, y: 280 },
      { type: 'cs_ci_cd', label: 'CI', value: 'Build & Test', x: 450, y: 180 },
      { type: 'cs_ci_cd', label: 'CD', value: 'Deploy Stage', x: 650, y: 180 },
      { type: 'cs_docker', label: 'IMG', value: 'Docker Image', x: 450, y: 380 },
      { type: 'cs_blob', label: 'REG', value: 'Registry', x: 650, y: 380 },
      { type: 'cs_k8s', label: 'STG', value: 'Staging', x: 870, y: 180 },
      { type: 'cs_k8s', label: 'PRD', value: 'Production', x: 870, y: 380 },
      { type: 'cs_monitor', label: 'OBS', value: 'Observability', x: 1070, y: 280 },
      { type: 'cs_decision', label: 'TST', value: 'Tests Pass?', x: 550, y: 500 },
    ]
  },
  database_design: {
    title: 'Database Architecture',
    keywords: ['database', 'db architecture', 'data layer', 'sql', 'nosql', 'database design', 'data architecture', 'storage architecture'],
    components: [
      { type: 'cs_api', label: 'API', value: 'Application', x: 60, y: 280 },
      { type: 'cs_redis', label: 'L1', value: 'L1 Cache', x: 280, y: 160 },
      { type: 'cs_redis', label: 'L2', value: 'L2 Cache', x: 280, y: 340 },
      { type: 'cs_database', label: 'PRIMARY', value: 'Primary DB', x: 520, y: 200 },
      { type: 'cs_database', label: 'REPLICA', value: 'Read Replica', x: 520, y: 380 },
      { type: 'cs_nosql', label: 'DOC', value: 'Document DB', x: 760, y: 160 },
      { type: 'cs_search', label: 'SRCH', value: 'Full-text', x: 760, y: 320 },
      { type: 'cs_blob', label: 'OBJ', value: 'Object Store', x: 760, y: 470 },
      { type: 'cs_data_warehouse', label: 'DW', value: 'Analytics DW', x: 1000, y: 280 },
      { type: 'cs_kafka', label: 'CDC', value: 'CDC Stream', x: 520, y: 540 },
    ]
  },
  event_driven: {
    title: 'Event-Driven Architecture',
    keywords: ['event driven', 'event bus', 'event stream', 'event sourcing', 'cqrs', 'saga', 'kafka', 'message driven'],
    components: [
      { type: 'cs_api', label: 'PROD1', value: 'Order Service', x: 60, y: 180 },
      { type: 'cs_api', label: 'PROD2', value: 'User Service', x: 60, y: 380 },
      { type: 'cs_kafka', label: 'KAFKA', value: 'Kafka', x: 340, y: 280 },
      { type: 'cs_pubsub', label: 'TOPIC', value: 'Topics', x: 340, y: 460 },
      { type: 'cs_microservice', label: 'CONS1', value: 'Notify Svc', x: 620, y: 160 },
      { type: 'cs_microservice', label: 'CONS2', value: 'Billing Svc', x: 620, y: 300 },
      { type: 'cs_microservice', label: 'CONS3', value: 'Analytics Svc', x: 620, y: 440 },
      { type: 'cs_database', label: 'ES', value: 'Event Store', x: 620, y: 580 },
      { type: 'cs_data_warehouse', label: 'DW', value: 'Analytics', x: 880, y: 440 },
      { type: 'cs_monitor', label: 'MON', value: 'Monitoring', x: 880, y: 280 },
    ]
  },
  cloud_architecture: {
    title: 'Cloud Architecture',
    keywords: ['cloud', 'aws', 'gcp', 'azure', 'cloud architecture', 'cloud design', 'cloud native', 'cloud system', 'serverless', 'cloud infra'],
    components: [
      { type: 'cs_user', label: 'USR', value: 'User', x: 60, y: 280 },
      { type: 'cs_internet', label: 'NET', value: 'Internet', x: 230, y: 280 },
      { type: 'cs_cdn', label: 'CDN', value: 'CDN', x: 430, y: 160 },
      { type: 'cs_lb', label: 'LB', value: 'Load Balancer', x: 430, y: 320 },
      { type: 'cs_k8s', label: 'EKS', value: 'K8s Cluster', x: 650, y: 240 },
      { type: 'cs_lambda', label: 'FN', value: 'Serverless', x: 650, y: 420 },
      { type: 'cs_database', label: 'RDS', value: 'Managed DB', x: 880, y: 200 },
      { type: 'cs_redis', label: 'EC', value: 'ElastiCache', x: 880, y: 360 },
      { type: 'cs_blob', label: 'S3', value: 'Object Store', x: 880, y: 510 },
      { type: 'cs_monitor', label: 'OBS', value: 'CloudWatch', x: 1100, y: 280 },
      { type: 'cs_firewall', label: 'WAF', value: 'WAF/Shield', x: 430, y: 500 },
    ]
  },
  real_time_system: {
    title: 'Real-time System',
    keywords: ['real time', 'realtime', 'websocket', 'streaming', 'live', 'socket.io', 'push notification', 'real-time', 'live update'],
    components: [
      { type: 'cs_browser', label: 'WEB', value: 'Browser', x: 60, y: 200 },
      { type: 'cs_mobile', label: 'MOB', value: 'Mobile', x: 60, y: 380 },
      { type: 'cs_gateway', label: 'WS', value: 'WebSocket GW', x: 300, y: 280 },
      { type: 'cs_server', label: 'RT', value: 'RT Server', x: 520, y: 280 },
      { type: 'cs_redis', label: 'PUB', value: 'Pub/Sub', x: 740, y: 180 },
      { type: 'cs_kafka', label: 'STR', value: 'Event Stream', x: 740, y: 380 },
      { type: 'cs_database', label: 'DB', value: 'TimescaleDB', x: 960, y: 280 },
      { type: 'cs_monitor', label: 'MON', value: 'Metrics', x: 960, y: 460 },
    ]
  },
}

export const CS_VOICE_ALIASES = {
  'user': 'cs_user', 'client': 'cs_user', 'end user': 'cs_user', 'browser': 'cs_browser', 'web browser': 'cs_browser',
  'mobile': 'cs_mobile', 'mobile app': 'cs_mobile', 'phone': 'cs_mobile', 'iot': 'cs_iot', 'iot device': 'cs_iot',
  'sensor node': 'cs_iot', 'server': 'cs_server', 'web server': 'cs_server', 'app server': 'cs_server', 'api': 'cs_api',
  'rest api': 'cs_api', 'endpoint': 'cs_api', 'graphql': 'cs_api', 'auth server': 'cs_auth_server', 'authentication server': 'cs_auth_server',
  'microservice': 'cs_microservice', 'service': 'cs_microservice', 'api gateway': 'cs_gateway', 'gateway': 'cs_gateway',
  'nginx': 'cs_gateway', 'load balancer': 'cs_lb', 'lb': 'cs_lb', 'cdn': 'cs_cdn', 'content delivery': 'cs_cdn',
  'webhook': 'cs_webhook', 'database': 'cs_database', 'sql': 'cs_database', 'postgres': 'cs_database', 'mysql': 'cs_database',
  'nosql': 'cs_nosql', 'mongo': 'cs_nosql', 'mongodb': 'cs_nosql', 'redis': 'cs_redis', 'cache': 'cs_redis',
  'memcache': 'cs_redis', 'blob storage': 'cs_blob', 's3': 'cs_blob', 'object storage': 'cs_blob', 'elasticsearch': 'cs_search',
  'search': 'cs_search', 'data warehouse': 'cs_data_warehouse', 'bigquery': 'cs_data_warehouse', 'message queue': 'cs_queue',
  'queue': 'cs_queue', 'rabbitmq': 'cs_queue', 'kafka': 'cs_kafka', 'event bus': 'cs_kafka', 'event stream': 'cs_kafka',
  'pubsub': 'cs_pubsub', 'pub sub': 'cs_pubsub', 'jwt': 'cs_jwt', 'token': 'cs_jwt', 'jwt token': 'cs_jwt',
  'oauth': 'cs_oauth', 'oauth2': 'cs_oauth', 'session': 'cs_session', 'session store': 'cs_session', 'firewall': 'cs_firewall',
  'waf': 'cs_firewall', 'mfa': 'cs_mfa', '2fa': 'cs_mfa', 'two factor': 'cs_mfa', 'ldap': 'cs_ldap', 'active directory': 'cs_ldap',
  'cloud': 'cs_cloud', 'aws': 'cs_cloud', 'gcp': 'cs_cloud', 'azure': 'cs_cloud', 'kubernetes': 'cs_k8s', 'k8s': 'cs_k8s',
  'pod': 'cs_k8s', 'docker': 'cs_docker', 'container': 'cs_docker', 'lambda': 'cs_lambda', 'serverless': 'cs_lambda',
  'function': 'cs_lambda', 'internet': 'cs_internet', 'network': 'cs_internet', 'process': 'cs_process', 'step': 'cs_process',
  'decision': 'cs_decision', 'condition': 'cs_decision', 'arrow': 'cs_flow_arrow', 'flow arrow': 'cs_flow_arrow',
  'start': 'cs_start', 'begin': 'cs_start', 'end': 'cs_end', 'finish': 'cs_end', 'monitoring': 'cs_monitor',
  'prometheus': 'cs_monitor', 'grafana': 'cs_monitor', 'logging': 'cs_logger', 'logs': 'cs_logger', 'elk': 'cs_logger',
  'ci cd': 'cs_ci_cd', 'pipeline': 'cs_ci_cd', 'cicd': 'cs_ci_cd',
}