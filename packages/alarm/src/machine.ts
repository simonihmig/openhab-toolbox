import { createMachine } from 'xstate';

const machine = createMachine(
  {
    id: 'alarm',
    schema: {},
    initial: 'idle',
    states: {
      idle: {
        on: {
          arm: {
            target: 'arming',
          },
        },
        entry: ['idle'],
        activities: ['idle'],
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
            entry: ['arming.waiting'],
            activities: ['arming.waiting'],
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
                    entry: ['arming.pending.disarm'],
                    activities: ['arming.pending.disarm'],
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
                    entry: ['arming.pending.sensor'],
                    activities: ['arming.pending.sensor'],
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
            entry: ['arming.pending'],
            activities: ['arming.pending'],
          },
        },

        onDone: 'armed',
        entry: ['arming'],
        activities: ['arming'],
      },
      armed: {
        on: {
          sensor: 'alarm',
          entry: 'entry',
        },
        entry: ['armed'],
        activities: ['armed'],
      },
      alarm: {
        entry: ['alarm'],
        activities: ['alarm'],
      },
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
            entry: ['entry.waiting'],
            activities: ['entry.waiting'],
          },
          warning: {
            after: [
              {
                delay: 'ENTRY_ALARM',
                target: 'timeout',
              },
            ],
            entry: ['entry.warning'],
            activities: ['entry.warning'],
          },
          timeout: {
            type: 'final',
          },
        },
        onDone: 'alarm',
        entry: ['entry'],
        activities: ['entry'],
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
