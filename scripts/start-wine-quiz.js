import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para o projeto WineQuizMobile_new
const wineQuizPath = path.join(__dirname, '../../WineQuizMobile_new');

console.log('Starting Wine Quiz server on port 3001...');
console.log('Wine Quiz path:', wineQuizPath);

// Configurar variáveis de ambiente para o WineQuiz
const env = {
  ...process.env,
  PORT: '3001',
  NODE_ENV: 'development'
};

// Spawn do processo do WineQuiz
const wineQuizProcess = spawn('npm', ['run', 'dev'], {
  cwd: wineQuizPath,
  env: env,
  stdio: 'inherit'
});

wineQuizProcess.on('error', (error) => {
  console.error('Failed to start Wine Quiz server:', error);
});

wineQuizProcess.on('close', (code) => {
  console.log(`Wine Quiz server exited with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down Wine Quiz server...');
  wineQuizProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Shutting down Wine Quiz server...');
  wineQuizProcess.kill('SIGTERM');
});