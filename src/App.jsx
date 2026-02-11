import { useEffect, useState, useRef } from "react";
import { WorkoutProvider } from "./context/WorkoutContext";
import { useWorkout } from "./hooks/useWorkout";
import clickSound from "./assets/ClickSound.m4a";
import {
  IoPlayOutline,
  IoPauseOutline,
  IoAddOutline,
  IoRemoveOutline,
  IoRefreshOutline,
  IoVolumeOffOutline,
  IoVolumeHighOutline,
} from "react-icons/io5";

import LogoImg from "./assets/Logo.svg";
import FooterAttribution from "./assets/FooterAttribution";

/**
 * Formats the current date/time for the header clock
 */
const formatTime = (date) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);

export default function App() {
  const [time, setTime] = useState(formatTime(new Date())); // Clock effect
  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <WorkoutProvider>
      <main>
        <header>
          <img
            src={LogoImg}
            alt="Digitalist logo"
            className="logo"
            width={30}
            height={30}
          />
          <h1>ReducerPulse</h1>
          <span>a workout timer</span>
          <div>
            <time>{time}</time>
            <ToggleSounds />
          </div>
        </header>
        <Calculator />
      </main>
      <FooterAttribution />
    </WorkoutProvider>
  );
}

/**
 * Handles workout calculations, countdown logic, and UI inputs
 */
function Calculator() {
  const {
    workouts,
    workoutName,
    sets,
    speed,
    durationBreak,
    manualOffset,
    allowSound,
    isRunning,
    dispatch,
  } = useWorkout();
  const isFirstRender = useRef(true);

  // Calculate duration logic
  const selectedWorkout =
    workouts.find((w) => w.name === workoutName) || workouts[0];
  const duration = Math.max(
    0,
    (selectedWorkout.numExercises * sets * speed) / 60 +
      (sets - 1) * durationBreak +
      manualOffset,
  );

  const mins = Math.floor(duration);
  const seconds = Math.round((duration - mins) * 60);

  /**
   * Handles the 1-second interval for the countdown
   */
  useEffect(() => {
    if (!isRunning || duration <= 0) return;
    const id = setInterval(() => dispatch({ type: "tick" }), 1000);
    return () => clearInterval(id);
  }, [isRunning, duration, dispatch]);

  /**
   * Plays sound effect on duration changes (except first render)
   */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (allowSound) new Audio(clickSound).play().catch(() => {});
  }, [duration, allowSound]);

  return (
    <>
      <form>
        <div>
          <label>Type of workout</label>
          <select
            value={workoutName}
            onChange={(e) =>
              dispatch({ type: "setWorkout", payload: e.target.value })
            }
          >
            {workouts.map((w) => (
              <option value={w.name} key={w.name}>
                {w.name} ({w.numExercises} exercises)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>How many sets?</label>
          <input
            type="range"
            min="1"
            max="5"
            value={sets}
            onChange={(e) =>
              dispatch({ type: "setSets", payload: +e.target.value })
            }
          />
          <span>
            {sets} {sets === 1 ? "set" : "sets"}
          </span>
        </div>

        <div>
          <label>How fast?</label>
          <input
            type="range"
            min="30"
            max="180"
            step="30"
            value={speed}
            onChange={(e) =>
              dispatch({ type: "setSpeed", payload: +e.target.value })
            }
          />
          <span>{speed} sec/exercise</span>
        </div>

        <div>
          <label>Break length</label>{" "}
          <input
            type="range"
            min="1"
            max="10"
            value={durationBreak}
            onChange={(e) =>
              dispatch({ type: "setBreak", payload: +e.target.value })
            }
          />
          <span>{durationBreak} min/break</span>
        </div>
      </form>

      <section>
        <div className="timer-controls">
          <button
            onClick={() => dispatch({ type: "adjustOffset", payload: -1 })}
          >
            <IoRemoveOutline />
          </button>
          <button
            onClick={() => dispatch({ type: "adjustOffset", payload: 1 })}
          >
            <IoAddOutline />
          </button>
        </div>

        <div className="timer-display">
          <p>
            {String(mins).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </p>
        </div>

        <div className="timer-controls">
          <button onClick={() => dispatch({ type: "toggleTimer" })}>
            {isRunning ? <IoPauseOutline /> : <IoPlayOutline />}
          </button>
          <button onClick={() => dispatch({ type: "reset" })}>
            <IoRefreshOutline />
          </button>
        </div>
      </section>
    </>
  );
}

/**
 * Button to toggle sound on/off
 */
function ToggleSounds() {
  const { allowSound, dispatch } = useWorkout();
  return (
    <button
      className="btn-sound"
      onClick={() => dispatch({ type: "toggleSound" })}
    >
      {allowSound ? <IoVolumeHighOutline /> : <IoVolumeOffOutline />}
    </button>
  );
}
