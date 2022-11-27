import { items, log, rules, triggers } from 'openhab';
import { interpret, MachineConfig, StateMachine } from 'xstate';
import { normalizeConfig, prefixCamelCased } from './utils';
import {
  ConditionPredicate,
  EventObject,
  InternalMachineOptions,
  StateSchema,
} from 'xstate/lib/types';

const { ItemStateChangeTrigger, ItemStateUpdateTrigger } = triggers;
const { JSRule } = rules;

interface EventConfig {
  items: Record<string, string>;
}

type EventsConfig = Record<string, EventConfig>;

type ItemsActions = Record<string, string>;

interface OpenhabCustomConfig {
  events: EventsConfig;
  activities: Record<string, ItemsActions>;
  actions: Record<string, ItemsActions>;
}

export type OpenhabXStateConfig<
  TContext,
  TEvent extends EventObject
> = OpenhabCustomConfig & MachineConfig<TContext, any, TEvent>;

export default class OpenhabXStateMachine<
  TContext,
  TStateSchema extends StateSchema,
  TEvent extends EventObject
> {
  private readonly name: string;
  private readonly logger: ReturnType<typeof log>;

  public service;

  constructor(
    name: string,
    machine: StateMachine<TContext, TStateSchema, TEvent>,
    xstateConfig: OpenhabXStateConfig<TContext, TEvent>,
    context?: TContext
  ) {
    this.name = name;
    this.logger = log(name);
    const { events, ...machineConfig } = xstateConfig;

    machine = machine.withConfig({
      guards: this.createGuards(events),
      ...normalizeConfig(machineConfig, this.logger),
    });

    if (context) {
      machine = machine.withContext(context);
    }

    this.service = interpret(machine);

    this.service.onTransition((state) => {
      this.logger.info(`Transitioned to ${JSON.stringify(state.value)}`);
    });

    this.setupRules(events);
  }

  createGuards(events: EventsConfig) {
    const guards: Record<string, ConditionPredicate<TContext, TEvent>> = {};

    for (const [key, config] of Object.entries(events)) {
      guards[prefixCamelCased('has', key)] = this.createGuard(config.items);
      guards[prefixCamelCased('no', key)] = this.createGuard(
        config.items,
        true
      );
    }

    return guards;
  }

  createGuard(
    itemHash: Record<string, string>,
    negate = false
  ): ConditionPredicate<TContext, TEvent> {
    return () => {
      const item = Object.entries(itemHash).find(([itemName, state]) => {
        const item = items.getItem(itemName);
        return negate ? item.state === state : item.state !== state;
      });
      if (item) {
        this.logger.info(
          `Aborting transition as item "${item[0]}" is in state "${item[1]}.`
        );
      }
      return !!item;
    };
  }

  setupRules(events: EventsConfig) {
    Object.entries(events).forEach(([event, config]) => {
      this.setupRule(event, config);
      this.setupRule(`${event}Changed`, config, true);
    });
  }

  setupRule(event: string, eventConfig: EventConfig, anyChange = false) {
    const itemConfig = eventConfig.items || {};
    const triggers = Object.entries(itemConfig).map(([itemName, state]) =>
      anyChange
        ? ItemStateChangeTrigger(itemName)
        : ItemStateUpdateTrigger(itemName, state)
    );

    JSRule({
      name: `${this.name} - event "${event}"`,
      triggers,
      execute: (args) => {
        this.logger.info(`Sending "${event}" event to state machine.`);
        this.service.send(event);
      },
    });
  }
}
