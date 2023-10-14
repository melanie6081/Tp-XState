import Konva from "konva";
import { createMachine, interpret } from "xstate";
import { inspect } from "@xstate/inspect";
inspect({
  iframe: () => document.querySelector('iframe[data-xstate]')
});

const stage = new Konva.Stage({
  container: "container",
  width: '400',
  height: 400,
});

const layer = new Konva.Layer();
stage.add(layer);

let rubber;

const rubberBandingMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QCcCuAjdZkCECGAdhAJYFQB0xEANmAMQCyA8gKoDKAogMIAyAklwDSAbQAMAXUSgADgHtYxAC7FZBKSAAeiAIwBmUeQBsAFgCsADgBMow9oDshu6bvmANCACeOu3fKnj2oamlo4AnMbGurqGAL4x7miY2PhEpBQQyHgA7mmMrJzMAGocYpJIIHIKyqrqWgjGoqbk4aF6xlaGnaKB7l4I5rrNrbqWraG62trBunEJGFi4hCRk5BnZuczs3PxCpeqVSipq5XXaoeSBxnbWdqGGuhGtvYgDQ3qjZxNTlqZx8SAEWQQODqRILFLLKD7eSHGonRAAWkmhnIlj0oUsEVEtwsoTcnkRg3aLjRhhs2gC2P8sxAYOSSzSlBoYGhVSOtURhnMqPRmIaOPMeOeCGs3LuXTsAXsokxsX+dMWqRWaxyZFZsOOoDqXwuZL0UVs5kuwusgxGRuR7VMplCzj+MSAA */
    id: "rubberBanding",
    initial: "idle",
    states: {
      idle: {
        on: {
          MOUSECLICK: {
            target: "drawing",
            actions: ["createLine"],
          },
        },
      },
      drawing: {
        on: {
          MOUSEMOVE: {
            actions: ["setLastPoint"],
          },
          MOUSECLICK: {
            target: "idle",
            actions: ["saveLine"],
          },
        },
      },
    },
  },
  {
    actions: {
      createLine: (context, event) => {
        const pos = stage.getPointerPosition();
        rubber = new Konva.Line({
          points: [pos.x, pos.y, pos.x, pos.y],
          stroke: "red",
          strokeWidth: 2,
        });
        layer.add(rubber);
      },
      setLastPoint: (context, event) => {
        const pos = stage.getPointerPosition();
        rubber.points([rubber.points()[0], rubber.points()[1], pos.x, pos.y]);
        layer.batchDraw();
      },
      saveLine: (context, event) => {
        // Save the line somewhere
      },
    },
  }
);

const rubberBandingService = 
interpret(rubberBandingMachine, { devTools: true })
  .onTransition((state) => {
    console.log("Current state:", state.value);
  })
  .start();

stage.on("click", () => {
  rubberBandingService.send("MOUSECLICK");
});

stage.on("mousemove", () => {
  rubberBandingService.send("MOUSEMOVE");
});