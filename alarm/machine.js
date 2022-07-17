import { createMachine } from 'xstate';

const machine = createMachine(
  {
    id: 'alarm',
    initial: 'idle',
    states: {
      idle: {
        on: {
          arm: {
            target: 'arming',
          },
        },
      },
      arming: {
        initial: 'pending',
        states: {
          ready: {
            type: 'final',
          },
          waiting: {
            after: [
              {
                delay: 'ARMED_ACTIVE',
                target: 'ready',
              },
            ],
          },
          pending: {
            type: 'parallel',
            states: {
              disarm: {
                initial: 'check',
                states: {
                  check: {
                    always: [
                      { target: 'blocked', cond: 'hasDisarm' },
                      { target: 'ready', cond: 'noDisarm' },
                    ],
                  },
                  blocked: {
                    on: {
                      disarmChanged: {
                        target: 'ready',
                        cond: 'noDisarn',
                      },
                    },
                  },
                  ready: {
                    type: 'final',
                  },
                },
              },
              sensor: {
                initial: 'check',
                states: {
                  check: {
                    always: [
                      { target: 'blocked', cond: 'hasSensor' },
                      { target: 'ready', cond: 'noSensor' },
                    ],
                  },
                  blocked: {
                    on: {
                      sensorChanged: {
                        target: 'ready',
                        cond: 'noSensor',
                      },
                    },
                  },
                  ready: {
                    type: 'final',
                    on: {
                      sensor: {
                        target: 'blocked',
                      },
                    },
                  },
                },
              },
            },
            onDone: 'waiting',
          },
        },

        onDone: 'armed',
      },
      armed: {
        on: {
          sensor: 'alarm',
          entry: 'entry',
        },
      },
      alarm: {},
      entry: {
        initial: 'waiting',
        states: {
          waiting: {
            after: [
              {
                delay: 'ENTRY_WARNING',
                target: 'warning',
              },
            ],
          },
          warning: {
            after: [
              {
                delay: 'ENTRY_ALARM',
                target: 'timeout',
              },
            ],
          },
          timeout: {
            type: 'final',
          },
        },
        onDone: 'alarm',
      },
    },
    on: {
      disarm: 'idle',
    },
  },
  {
    delays: {
      ENTRY_WARNING: 5000,
      ENTRY_ALARM: 5000,
      ARMED_ACTIVE: 5000,
    },

    guards: {
      hasSensor: () => false,
      noSensor: () => true,
      hasDisarm: () => false,
      noDisarm: () => true,
    },
  }
);

export default machine;
