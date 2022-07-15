import { createMachine, assign } from "xstate";

const timeFactor = 1000;
const targetTemperature = 20;

const machine = createMachine(
  {
    id: "window",
    initial: "closed",
    context: {
      temperature: 20,
    },
    states: {
      closed: {
        on: {
          open: {
            target: "open",
          },
        },
      },
      open: {
        after: [
          {
            delay: ({ temperature }) =>
              Math.max(0, (targetTemperature - temperature) * timeFactor),
            target: "warning",
            cond: "isTooCold",
          },
        ],
        on: {
          close: {
            target: "closed",
          },
          setTemperature: {
            target: "open",
            internal: false,
            actions: ["setTemperature"],
          },
        },
      },
      warning: {
        on: {
          close: {
            target: "closed",
          },
        },
        entry: ["warning"],
        activities: ["warning"],
      },
    },
    on: {
      setTemperature: {
        actions: ["setTemperature"],
      },
    },
  },
  {
    actions: {
      setTemperature: assign({
        temperature: (context, event) => event.value,
      }),
    },
    guards: {
      isTooCold: (context, event) => context.temperature < targetTemperature,
    },
  }
);
