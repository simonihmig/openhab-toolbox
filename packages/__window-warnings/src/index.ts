import OpenhabXStateMachine from '@openhab-toolbox/xstate';
import machineFactory from './machine';
import { items, triggers, rules } from 'openhab';

const { ItemStateChangeTrigger } = triggers;
const { JSRule } = rules;

interface WindowWarningOptions {
  windowContacts: string[];
  temperatureItem: string;
  targetTemperatureItem: string;
  delayBase: number;
  delayExponent: number;
}

export default function createWindowWarning(
  { windowContacts, temperatureItem, temperatureLimit = 16, timeFactor = 1 }: WindowWarningOptions,
  machineConfig = {}
) {
  if (!windowContacts) {
    throw new Error('No windowContacts defined in config');
  }

  if (!temperatureItem) {
    throw new Error('No temperatureItem defined in config');
  }

  const context = {
    temperature: parseFloat(items.getItem(temperatureItem).state, 10),
  };

  const services = windowContacts.map((sensor) => {
    const machine = machineFactory(temperatureLimit, timeFactor);

    const service = new OpenhabXStateMachine(
      `openhab-window-warning-${sensor}`,
      machine,
      {
        events: {
          open: {
            items: {
              [sensor]: 'OPEN',
            },
          },
          close: {
            items: {
              [sensor]: 'CLOSED',
            },
          },
        },
        ...machineConfig,
      },
      context
    ).service;

    service.start();

    if (items.getItem(sensor).state === 'OPEN') {
      service.send('open');
    }

    return service;
  });

  JSRule({
    name: `openhab-window-warning setTemperature`,
    triggers: [ItemStateChangeTrigger(temperatureItem)],
    execute: ({ state }) => {
      // this.logger.info(`Sending "${event}" event to state machine.`);
      services.forEach((service) => {
        service.send({
          type: 'setTemperature',
          value: parseFloat(state, 10),
        });
      });
    },
  });
};
