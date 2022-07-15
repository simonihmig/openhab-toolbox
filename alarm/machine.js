import { createMachine } from 'xstate';
import logger from './log';

export default createMachine(
  {
    id: 'alarm',
    initial: 'idle',
    states: {
      idle: {
        on: {
          ARM: {
            target: 'armed',
          },
        },
      },
      armed: {
        initial: 'pending',
        states: {
          pending: {
            after: [
              {
                delay: 'ARMED_ACTIVE',
                target: 'active',
              },
            ],
            on: {
              SENSOR: {
                target: undefined,
              },
            },
          },
          active: {},
        },
        on: {
          DISARM: {
            target: 'idle',
          },
          SENSOR: {
            target: 'alarm',
          },
        },
        activities: ['signalArmed'],
      },
      alarm: {
        on: {
          DISARM: {
            target: 'idle',
          },
        },
        activities: ['signalAlarm'],
      },
      intrusion: {
        initial: 'silent',
        states: {
          silent: {
            after: [
              {
                delay: 'INTRUSION_SILENT',
                target: 'warning',
              },
            ],
          },
          warning: {
            activities: ['signalWarning'],
          },
        },
        after: [
          {
            delay: 'INTRUSION_ALARM',
            target: 'alarm',
          },
        ],
        on: {
          DISARM: {
            target: 'idle',
          },
        },
      },
    },
  },
  {
    delays: {
      INTRUSION_SILENT: 2000,
      INTRUSION_ALARM: 4000,
      ARMED_ACTIVE: 2000,
    },
    activities: {
      signalAlarm: () => {
        logger.error('ALARM');
      },
      signalArmed: () => {
        logger.info('ARMED');
      },
      signalWarning: () => {
        logger.warn('WARNING');
      },
    },
  }
);
