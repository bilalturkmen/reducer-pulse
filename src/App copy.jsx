import { useEffect, useMemo, useState, useRef } from "react";
import clickSound from "./ClickSound.m4a";

// Format date and time for display
const formatTime = (date) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);

export default function App() {
  const [allowSound, setAllowSound] = useState(true);
  const [time, setTime] = useState(formatTime(new Date()));

  // Determine AM or PM for workout adjustments
  const partOfDay = new Date().getHours() < 12 ? "AM" : "PM";

  // Memoize workouts to avoid recalculating on every render
  const workouts = useMemo(() => {
    const baseWorkouts = [
      { name: "Full-body workout", numExercises: partOfDay === "AM" ? 9 : 8 },
      { name: "Arms + Legs", numExercises: 6 },
      { name: "Arms only", numExercises: 3 },
      { name: "Legs only", numExercises: 4 },
      { name: "Core only", numExercises: partOfDay === "AM" ? 5 : 4 },
    ];
    return baseWorkouts;
  }, [partOfDay]);

  // Update time every second
  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <main>
      <header>
        <h1>Workout timer</h1>
        <time>{time}</time>
      </header>

      <ToggleSounds allowSound={allowSound} setAllowSound={setAllowSound} />
      <Calculator workouts={workouts} allowSound={allowSound} />
    </main>
  );
}

// Calculator component handles workout duration calculation and adjustments
function Calculator({ workouts, allowSound }) {
  const [workoutName, setWorkoutName] = useState(workouts[0].name);
  const [sets, setSets] = useState(3);
  const [speed, setSpeed] = useState(90);
  const [durationBreak, setDurationBreak] = useState(5);

  // manualOffset tracks adjustments made via +/- buttons
  const [manualOffset, setManualOffset] = useState(0);

  // Ref to track first render for sound effect
  const isFirstRender = useRef(true);

  // Find the selected workout based on user choice
  const selectedWorkout =
    workouts.find((w) => w.name === workoutName) || workouts[0];

  // 1. Derived State: Calculated every render, no useEffect needed
  const baseDuration =
    (selectedWorkout.numExercises * sets * speed) / 60 +
    (sets - 1) * durationBreak;

  // Ensure duration doesn't go below zero
  const duration = Math.max(0, baseDuration + manualOffset);
  // Split duration into minutes and seconds for display
  const mins = Math.floor(duration);
  const seconds = Math.round((duration - mins) * 60);

  // 2. Sound Effect: Triggers on any input change or when sound is enabled
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (allowSound) {
      const audio = new Audio(clickSound);
      audio.play();
    }
  }, [duration, workoutName, sets, speed, durationBreak, allowSound]);

  // Reset manual adjustments when primary inputs change
  const handleInputChange = (setter, value) => {
    setter(value);
    setManualOffset(0);
  };

  return (
    <>
      <form>
        <div>
          <label>Type of workout</label>
          <select
            value={workoutName}
            onChange={(e) => handleInputChange(setWorkoutName, e.target.value)}
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
            onChange={(e) => handleInputChange(setSets, +e.target.value)}
          />
          <span>{sets}</span>
        </div>
        <div>
          <label>How fast are you?</label>
          <input
            type="range"
            min="30"
            max="180"
            step="30"
            value={speed}
            onChange={(e) => handleInputChange(setSpeed, +e.target.value)}
          />
          <span>{speed} sec/exercise</span>
        </div>
        <div>
          <label>Break length</label>
          <input
            type="range"
            min="1"
            max="10"
            value={durationBreak}
            onChange={(e) =>
              handleInputChange(setDurationBreak, +e.target.value)
            }
          />
          <span>{durationBreak} min/break</span>
        </div>
      </form>
      <section>
        <button onClick={() => setManualOffset((m) => m - 1)}>−</button>
        <p>
          {String(mins).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </p>
        <button onClick={() => setManualOffset((m) => m + 1)}>+</button>
      </section>
    </>
  );
}

// ToggleSounds component to enable or disable sound effects
function ToggleSounds({ allowSound, setAllowSound }) {
  return (
    <button className="btn-sound" onClick={() => setAllowSound((s) => !s)}>
      {allowSound ? "🔈" : "🔇"}
    </button>
  );
}
