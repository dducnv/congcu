"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Task = {
  id: string;
  title: string;
  done: boolean;
};

type PomodoroSettings = {
  focusMinutes: number;
  breakMinutes: number;
  soundEnabled: boolean;
};

type PomodoroStats = {
  date: string; // YYYY-MM-DD
  completedFocus: number; // số phiên focus hoàn thành hôm nay
};

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  breakMinutes: 5,
  soundEnabled: true,
};

const STORAGE_KEYS = {
  tasks: "pomodoro.tasks",
  settings: "pomodoro.settings",
  stats: "pomodoro.stats",
} as const;

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function getToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function useLocalStorage<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setState(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, [key]);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [key, state]);

  return [state, setState] as const;
}

export default function PomodoroPage() {
  // settings & stats
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>(
    STORAGE_KEYS.settings,
    DEFAULT_SETTINGS
  );
  const [stats, setStats] = useLocalStorage<PomodoroStats>(STORAGE_KEYS.stats, {
    date: getToday(),
    completedFocus: 0,
  });

  // tasks
  const [tasks, setTasks] = useLocalStorage<Task[]>(STORAGE_KEYS.tasks, []);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // timer
  const [isRunning, setIsRunning] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(true);
  const totalSeconds = useMemo(
    () => (isFocusMode ? settings.focusMinutes : settings.breakMinutes) * 60,
    [isFocusMode, settings.focusMinutes, settings.breakMinutes]
  );
  const [timeLeft, setTimeLeft] = useState<number>(totalSeconds);
  const [justEnded, setJustEnded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // reset time when changing durations or mode
  useEffect(() => {
    setTimeLeft(totalSeconds);
  }, [totalSeconds]);

  // daily reset stats if date changed
  useEffect(() => {
    const today = getToday();
    if (stats.date !== today) {
      setStats({ date: today, completedFocus: 0 });
    }
  }, [stats.date, setStats]);

  // timer effect
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current as unknown as number);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // end session
          setIsRunning(false);
          setJustEnded(true);
          setTimeout(() => setJustEnded(false), 800);
          if (settings.soundEnabled) {
            try {
              audioRef.current?.play().catch(() => { });
            } catch {
              // ignore
            }
          }
          // increment stats if focus finished
          if (isFocusMode) {
            setStats((s) => ({ ...s, completedFocus: s.completedFocus + 1 }));
          }
          // auto switch mode but paused
          setIsFocusMode((m) => !m);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current as unknown as number);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isFocusMode, settings.soundEnabled, setStats]);

  const progress = useMemo(() => {
    const elapsed = totalSeconds - timeLeft;
    if (totalSeconds <= 0) return 0;
    const p = elapsed / totalSeconds;
    return Math.min(Math.max(p, 0), 1);
  }, [timeLeft, totalSeconds]);

  const circumference = 2 * Math.PI * 100; // r=100
  const dashOffset = circumference * (1 - progress);

  function handleStartPause() {
    if (timeLeft === 0) {
      // if ended, reset to new session of current mode
      setTimeLeft(totalSeconds);
    }
    setIsRunning((r) => !r);
  }

  function handleReset() {
    setIsRunning(false);
    setTimeLeft(totalSeconds);
  }

  function handleSkip() {
    setIsRunning(false);
    if (isFocusMode) {
      // skipping focus does not increase stats
    }
    setIsFocusMode((m) => !m);
    setTimeLeft((prev) => (prev === 0 ? totalSeconds : totalSeconds));
  }

  function updateMinutes(kind: "focus" | "break", minutes: number) {
    const m = Math.max(1, Math.min(180, Math.floor(minutes)));
    setSettings((s) =>
      kind === "focus"
        ? { ...s, focusMinutes: m }
        : { ...s, breakMinutes: m }
    );
  }

  // tasks handlers
  function addTask() {
    const title = newTaskTitle.trim();
    if (!title) return;
    const t: Task = {
      id: crypto.randomUUID(),
      title,
      done: false,
    };
    setTasks((list) => [t, ...list]);
    setNewTaskTitle("");
  }

  function toggleTask(id: string) {
    setTasks((list) =>
      list.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  function deleteTask(id: string) {
    setTasks((list) => list.filter((t) => t.id !== id));
  }

  function beginEditTask(task: Task) {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  }

  function commitEditTask() {
    if (!editingTaskId) return;
    const title = editingTitle.trim();
    if (!title) {
      // empty -> delete
      setTasks((list) => list.filter((t) => t.id !== editingTaskId));
    } else {
      setTasks((list) =>
        list.map((t) => (t.id === editingTaskId ? { ...t, title } : t))
      );
    }
    setEditingTaskId(null);
    setEditingTitle("");
  }

  // drag & drop reorder
  const dragItemId = useRef<string | null>(null);

  function onDragStart(e: React.DragEvent<HTMLDivElement>, id: string) {
    dragItemId.current = id;
    e.dataTransfer.effectAllowed = "move";
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>, overId: string) {
    e.preventDefault();
    const fromId = dragItemId.current;
    dragItemId.current = null;
    if (!fromId || fromId === overId) return;
    setTasks((list) => {
      const copy = [...list];
      const fromIndex = copy.findIndex((t) => t.id === fromId);
      const toIndex = copy.findIndex((t) => t.id === overId);
      if (fromIndex === -1 || toIndex === -1) return list;
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
  }

  // base64 short beep sound (440Hz, ~0.2s)
  const BEEP_SRC =
    "data:audio/wav;base64,UklGRoQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAAAAAACAgICAgICAgICAgICAQEBAREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREQ==";

  return (
    <div className="max-w-6xl m-auto px-4 py-10 lg:py-12">
      <audio ref={audioRef} src={BEEP_SRC} preload="auto" />
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Timer Card */}
        <div className="flex-1">
          <div className="bg-white border border-black rounded-2xl shadow-blog-l  p-6 lg:p-8">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded-full border border-black text-sm ${isFocusMode ? "bg-black text-white" : "bg-white"
                    }`}
                  onClick={() => {
                    setIsFocusMode(true);
                    setIsRunning(false);
                    setTimeLeft(settings.focusMinutes * 60);
                  }}
                >
                  Focus
                </button>
                <button
                  className={`px-3 py-1 rounded-full border border-black text-sm ${!isFocusMode ? "bg-black text-white" : "bg-white"
                    }`}
                  onClick={() => {
                    setIsFocusMode(false);
                    setIsRunning(false);
                    setTimeLeft(settings.breakMinutes * 60);
                  }}
                >
                  Break
                </button>
              </div>
              <div className="text-sm text-gray-600">
                Hôm nay: <span className="font-semibold">{stats.completedFocus}</span> Pomodoro
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center">
              <div className={`relative w-[260px] h-[260px] ${justEnded ? "animate-pulse" : ""
                }`}>
                <svg width="260" height="260" viewBox="0 0 220 220" className="rotate-[-90deg]">
                  {/* background circle */}
                  <circle
                    cx="110"
                    cy="110"
                    r="100"
                    stroke="#E5E7EB"
                    strokeWidth="10"
                    fill="none"
                  />
                  {/* progress circle */}
                  <circle
                    cx="110"
                    cy="110"
                    r="100"
                    stroke="#111827"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    className="transition-[stroke-dashoffset] duration-300 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 rotate-0 flex items-center justify-center">
                  <div className="text-6xl font-semibold tracking-tight text-mono">
                    {formatTime(timeLeft)}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={handleStartPause}
                  className="px-5 py-2.5 rounded-full border border-black bg-black text-white"
                >
                  {isRunning ? "Pause" : "Start"}
                </button>
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-full border border-black bg-white"
                >
                  Reset
                </button>
                <button
                  onClick={handleSkip}
                  className="px-5 py-2.5 rounded-full border border-black bg-white"
                >
                  Skip
                </button>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 w-full max-w-md">
                <div className="col-span-2">
                  <label className="text-sm text-gray-600">Focus (phút)</label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    className="mt-1 w-full border border-black rounded-lg px-3 py-2 outline-none"
                    value={settings.focusMinutes}
                    onChange={(e) => updateMinutes("focus", Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Break</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    className="mt-1 w-full border border-black rounded-lg px-3 py-2 outline-none"
                    value={settings.breakMinutes}
                    onChange={(e) => updateMinutes("break", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, soundEnabled: e.target.checked }))
                    }
                  />
                  Âm báo khi kết thúc
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Card */}
        <div className="w-full lg:w-[420px]">
          <div className="bg-white border border-black rounded-2xl shadow-blog-l p-6 lg:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Tasks</h2>
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTask();
                }}
                placeholder="Thêm nhiệm vụ mới..."
                className="flex-1 border border-black rounded-xl px-3 py-2 outline-none"
              />
              <button
                onClick={addTask}
                className="px-4 py-2 rounded-xl border border-black bg-black text-white"
              >
                Add
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className="group border border-black rounded-xl bg-white hover:shadow-social-l hover:translate-y-social-4m hover:translate-x-social-4p transition ease-in duration-150"
                  draggable
                  onDragStart={(e) => onDragStart(e, t.id)}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, t.id)}
                >
                  <div className="p-3 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => toggleTask(t.id)}
                      className="mt-0.5"
                    />
                    {editingTaskId === t.id ? (
                      <input
                        autoFocus
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={commitEditTask}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitEditTask();
                          if (e.key === "Escape") {
                            setEditingTaskId(null);
                            setEditingTitle("");
                          }
                        }}
                        className="flex-1 border border-black rounded px-2 py-1 outline-none"
                      />
                    ) : (
                      <button
                        className={`text-left flex-1 ${t.done ? "line-through text-gray-400" : ""
                          }`}
                        onClick={() => beginEditTask(t)}
                        title="Click để sửa"
                      >
                        {t.title}
                      </button>
                    )}

                    <button
                      onClick={() => deleteTask(t.id)}
                      className="opacity-70 hover:opacity-100 text-sm w-6 h-6 border border-black rounded-full"
                      title="Xoá"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-sm text-gray-500">Chưa có task nào. Hãy thêm một task để bắt đầu tập trung.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}