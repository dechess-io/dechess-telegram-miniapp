export const initiaTimelState = {
  player1Timer: 0,
  player2Timer: 0,
  lastUpdateTime: Date.now(),
};

export function timerReducer(state: any, action: any) {
  switch (action.type) {
    case 'UPDATE_TIMER':
      const { player, elapsedTime } = action.payload;
      const timerKey = player === 'player1' ? 'player1Timer' : 'player2Timer';
      return {
        ...state,
        [timerKey]: Math.max(state[timerKey] - elapsedTime, 0),
        lastUpdateTime: Date.now(),
      };
    case 'SET_PLAYER1_TIMER':
      return { ...state, player1Timer: action.payload };
    case 'SET_PLAYER2_TIMER':
      return { ...state, player2Timer: action.payload };
    case 'DECREMENT_TIMER':
      const { currentPlayer } = action.payload;
      if (currentPlayer === 'player1') {
        return {
          ...state,
          player1Timer: Math.max(state.player1Timer - 1, 0),
          lastUpdateTime: Date.now(),
        };
      } else if (currentPlayer === 'player2') {
        return {
          ...state,
          player2Timer: Math.max(state.player2Timer - 1, 0),
          lastUpdateTime: Date.now(),
        };
      }
      break;
    default:
      return state;
  }
}
