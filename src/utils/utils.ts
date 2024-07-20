import axios from 'axios';

const nameLists = [
  'Callie',
  'Tigger',
  'Snickers',
  'Midnight',
  'Trouble',
  'Sammy',
  'Simon',
  'Oliver',
  'Lilly',
  'Abby',
  'Oreo',
  'Angel',
  'Luna',
  'Jack',
  'Salem',
];

export const setAuthToken = (token: string) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else delete axios.defaults.headers.common['Authorization'];
};

export const apiHeader = {
  Authorization: `Bearer ${localStorage.getItem('token')}`,
};

export function hasJWT() {
  let flag = false;
  flag = localStorage.getItem('token') ? true : false;
  return flag;
}

export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

export const getAvatarName = (): string => {
  return nameLists[Math.floor(Math.random() * nameLists.length)];
};

export const getTimeFromLocalStorage = (key: string, defaultValue: number) => {
  const savedTime = localStorage.getItem(key);
  return savedTime !== null ? Number(savedTime) : defaultValue;
};

export const getLastUpdateTime = () => {
  const lastUpdateTime = localStorage.getItem('lastUpdateTime');
  return lastUpdateTime !== null ? Number(lastUpdateTime) : Date.now();
};

type ChessPieces = {
  [key: string]: string;
};

const blackPieces: ChessPieces = {
  K: '♔',
  Q: '♕',
  N: '♘',
  B: '♗',
  R: '♖',
};

const whitePieces: ChessPieces = {
  K: '♚',
  Q: '♛',
  N: '♞',
  B: '♝',
  R: '♜',
};

export function convertToFigurineSan(str: string, turn: string): string {
  let mp: ChessPieces;
  mp = turn === 'w' ? whitePieces : blackPieces;
  if (mp.hasOwnProperty(str[0])) {
    return mp[str[0]] + str.slice(1);
  }
  return str;
}

const normalizeFEN = (fen: string): string => {
  // Remove the halfmove clock and fullmove number from the FEN
  return fen.split(' ').slice(0, 4).join(' ');
};

const addPositions = (fens: string[]): { [fen: string]: number } => {
  const positionHistory: { [fen: string]: number } = {};
  fens.forEach((fen) => {
    const normalizedFen = normalizeFEN(fen);
    if (positionHistory[normalizedFen]) {
      positionHistory[normalizedFen]++;
    } else {
      positionHistory[normalizedFen] = 1;
    }
  });
  return positionHistory;
};

export const isThreefoldRepetition = (fens: string[]): boolean => {
  const positionHistory = addPositions(fens);
  const lastFen = fens[fens.length - 1];
  return positionHistory[normalizeFEN(lastFen)] >= 3;
};

export const getRemainingTime = (timer: any, startTime: any) => {
  // timer remain of a player is the total left time minus the time passed (current time - start time of that user) in seconds (minus 500 for prevent round up)
  return Math.max(timer - Math.floor((Date.now() - startTime - 500) / 1000), 0);
};

export const setLocalStorage = (key: any, value: any) => {
  if (value !== undefined && value !== null) {
    localStorage.setItem(key, value.toString());
  }
};
