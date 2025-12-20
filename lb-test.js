import http from 'k6/http'
import { check, sleep } from 'k6'

// 1. ตั้งค่าการทดสอบให้สอดคล้องกับ SLO และ Chaos Testing
export const options = {
  stages: [
    { duration: '2m', target: 40 }, // Warm-up: ค่อยๆ เพิ่ม Traffic
    { duration: '5m', target: 120 }, // Traffic Flood: จำลอง Grand Opening [cite: 7, 55]
    { duration: '2m', target: 0 }, // Ramp-down
  ],
  thresholds: {
    // ตรวจสอบ SLO 99.9% (Error Rate ต้องน้อยกว่า 0.1%) [cite: 45, 152]
    http_req_failed: ['rate<0.001'],
    // ตรวจสอบ Latency (Golden Signal) [cite: 39]
    http_req_duration: ['p(95)<500'],
  },
}

export default function () {
  // เปลี่ยนเป็น IP ของ Load Balancer หรือ Backend Service ของทีม Node 7 [cite: 122]
  const url = 'http://10.13.104.89:3000/api/students'

  const res = http.get(url)

  // 2. การวัดผล SLI (Successful Requests / Total Requests) [cite: 153]
  check(res, {
    'is status 200': (r) => r.status === 200,
  })

  // จำลองพฤติกรรมผู้ใช้จริง (Pacing)
  sleep(1)
}
