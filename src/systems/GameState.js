const initialState = {
  hasDaisy: false,
  hasSpruzzino: false,
  onofrioCompleted: false,
  crossroadStarted: false,
  catIntroSeen: false,
  currentArea: 'forest',
  currentPath: null,
  scenarioStarted: false,
  madamaStarted: false,
  sposineStarted: false,
  pittoreStarted: false,
  calore: 0,
  ritmo: 0,
  quiete: 0,
  lastChoice: null,
  hatterColored: false
};

export const GameState = {
  ...initialState,

  resetForNewRun() {
    Object.assign(this, initialState);
  }
};
