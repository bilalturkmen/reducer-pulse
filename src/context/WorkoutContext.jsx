import { createContext, useReducer, useMemo } from "react";

const WorkoutContext = createContext();

const initialState = {
  allowSound: true,
  workoutName: "Full-body workout",
  sets: 3,
  speed: 90,
  durationBreak: 5,
  manualOffset: 0,
  isRunning: false,
};

/**
 * Helper to reset timer-related values when workout parameters change
 */
const resetTimer = { manualOffset: 0, isRunning: false };

function reducer(state, action) {
  switch (action.type) {
    case "toggleSound":
      return { ...state, allowSound: !state.allowSound };
    case "setWorkout":
      return { ...state, workoutName: action.payload, ...resetTimer };
    case "setSets":
      return { ...state, sets: action.payload, ...resetTimer };
    case "setSpeed":
      return { ...state, speed: action.payload, ...resetTimer };
    case "setBreak":
      return { ...state, durationBreak: action.payload, ...resetTimer };
    case "adjustOffset":
      return { ...state, manualOffset: state.manualOffset + action.payload };
    case "tick":
      return { ...state, manualOffset: state.manualOffset - 1 / 60 };
    case "toggleTimer":
      return { ...state, isRunning: !state.isRunning };
    case "reset":
      return { ...initialState, allowSound: state.allowSound };
    default:
      throw new Error("Unknown action");
  }
}

export function WorkoutProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const isAM = new Date().getHours() < 12;

  /**
   * Generates workout list based on time of day
   */
  const workouts = useMemo(
    () => [
      { name: "Full-body workout", numExercises: isAM ? 9 : 8 },
      { name: "Arms + Legs", numExercises: 6 },
      { name: "Arms only", numExercises: 3 },
      { name: "Legs only", numExercises: 4 },
      { name: "Core only", numExercises: isAM ? 5 : 4 },
    ],
    [isAM],
  );

  const value = useMemo(
    () => ({ ...state, workouts, dispatch }),
    [state, workouts],
  );

  return (
    <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>
  );
}

export { WorkoutContext };
