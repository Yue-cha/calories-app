const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Đang khởi động hệ thống CaloTrack (Backend + Frontend)...');

// Start backend
const serverProcess = spawn('npm', ['start'], {
  cwd: path.resolve(__dirname, 'server'),
  stdio: 'inherit',
  shell: true,
});

// Start frontend
const clientProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.resolve(__dirname, 'client'),
  stdio: 'inherit',
  shell: true,
});

function cleanup() {
  console.log('\n🛑 Đang dừng các dịch vụ CaloTrack...');
  serverProcess.kill();
  clientProcess.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

