
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const startingAttributes = {
  Strength: 26,
  Intelligence: 90,
  Discipline: 98,
  Social: 23,
  Creativity: 85,
  Financial: 100
};

const defaultData = {
  player: "Player",
  level: 1,
  xp: 0,
  attributes: startingAttributes,
  goals: [],
  missions: [],
  achievements: [],
  history: []
};

const navigation = [
  "Profile",
  "Goals",
  "Missions",
  "Statistics",
  "Achievements",
  "Settings"
];

function interpretGoal(goal) {
  const text = goal.toLowerCase();

  if (text.includes("fitness") || text.includes("gym") || text.includes("strength")) {
    return {
      description: "Build physical capability through consistent training, recovery and measurable progress.",
      requirements: ["Create a realistic training routine", "Track workouts and performance", "Allow time for recovery"],
      attribute: "Strength"
    };
  }

  if (text.includes("money") || text.includes("save") || text.includes("financial")) {
    return {
      description: "Improve your financial position through controlled spending, saving and measurable targets.",
      requirements: ["Set a savings target", "Track income and spending", "Review progress regularly"],
      attribute: "Financial"
    };
  }

  if (text.includes("learn") || text.includes("study") || text.includes("skill")) {
    return {
      description: "Develop knowledge or a practical skill through structured learning and consistent practice.",
      requirements: ["Identify what needs to be learned", "Create a learning schedule", "Test and review your progress"],
      attribute: "Intelligence"
    };
  }

  if (text.includes("social") || text.includes("friend") || text.includes("relationship")) {
    return {
      description: "Strengthen social confidence and relationships through meaningful communication and action.",
      requirements: ["Identify opportunities to connect", "Practise communication", "Build consistency"],
      attribute: "Social"
    };
  }

  return {
    description: "Turn your ambition into a structured plan with clear actions, milestones and measurable progress.",
    requirements: ["Define what success looks like", "Identify the resources required", "Take consistent action and review progress"],
    attribute: "Discipline"
  };
}

function App() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem("evil-save");
      return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
    } catch {
      return defaultData;
    }
  });

  const [page, setPage] = useState("Profile");
  const [goalInput, setGoalInput] = useState("");
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [playerInput, setPlayerInput] = useState(data.player);

  useEffect(() => {
    localStorage.setItem("evil-save", JSON.stringify(data));
  }, [data]);

  function addGoal() {
    if (!goalInput.trim()) return;

    const interpretation = interpretGoal(goalInput);
    const goal = {
      id: Date.now(),
      title: goalInput.trim(),
      description: interpretation.description,
      requirements: interpretation.requirements,
      attribute: interpretation.attribute,
      status: "Review",
      progress: 0,
      created: new Date().toLocaleDateString()
    };

    setSelectedGoal(goal);
    setData(previous => ({
      ...previous,
      goals: [...previous.goals, goal]
    }));
    setGoalInput("");
  }

  function activateGoal(goal) {
    const mission = {
      id: Date.now() + 1,
      goalId: goal.id,
      title: `Complete the first step towards: ${goal.title}`,
      description: goal.requirements[0],
      status: "Active",
      xp: 50
    };

    setData(previous => ({
      ...previous,
      goals: previous.goals.map(item =>
        item.id === goal.id ? { ...item, status: "Active" } : item
      ),
      missions: [...previous.missions, mission]
    }));

    setSelectedGoal(null);
    setPage("Missions");
  }

  function completeMission(mission) {
    if (mission.status === "Complete") return;

    const earnedXP = mission.xp || 50;
    const totalXP = data.xp + earnedXP;
    const newLevel = data.level + Math.floor(totalXP / 1000);
    const remainingXP = totalXP % 1000;

    const achievement = {
      id: Date.now(),
      title: "Mission Accomplished",
      description: mission.title,
      date: new Date().toLocaleDateString(),
      xp: earnedXP
    };

    setData(previous => ({
      ...previous,
      level: newLevel,
      xp: remainingXP,
      missions: previous.missions.map(item =>
        item.id === mission.id ? { ...item, status: "Complete" } : item
      ),
      goals: previous.goals.map(goal =>
        goal.id === mission.goalId
          ? { ...goal, progress: Math.min(100, goal.progress + 10) }
          : goal
      ),
      achievements: [...previous.achievements, achievement],
      history: [...previous.history, {
        title: mission.title,
        date: new Date().toLocaleDateString(),
        xp: earnedXP
      }]
    }));
  }

  function updatePlayer() {
    setData(previous => ({ ...previous, player: playerInput.trim() || "Player" }));
  }

  function resetData() {
    if (window.confirm("Reset all EVIL progress? This cannot be undone.")) {
      setData(defaultData);
      setPlayerInput("Player");
      setPage("Profile");
    }
  }

  const completedMissions = data.missions.filter(
    mission => mission.status === "Complete"
  ).length;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">EVIL<span>✦</span></div>
        <div className="topbar-level">LEVEL {data.level}</div>
      </header>

      <main className="main-content">
        {page === "Profile" && (
          <section>
            <p className="eyebrow">PLAYER PROFILE</p>
            <h1>{data.player}</h1>
            <p className="muted">EVERYDAY VISION • INDIVIDUAL LEVELING</p>

            <div className="panel">
              <p className="eyebrow">CURRENT LEVEL</p>
              <h2>LEVEL {data.level}</h2>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${data.xp / 10}%` }} />
              </div>
              <p>{data.xp} / 1000 XP</p>
            </div>

            <div className="panel">
              <h2>ATTRIBUTES</h2>
              {Object.entries(data.attributes).map(([name, value]) => (
                <div className="attribute" key={name}>
                  <div className="attribute-heading">
                    <span>{name}</span><strong>{value}/100</strong>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="stats-grid">
              <div className="panel"><strong>{data.goals.length}</strong><p>GOALS</p></div>
              <div className="panel"><strong>{completedMissions}</strong><p>MISSIONS DONE</p></div>
            </div>
          </section>
        )}

        {page === "Goals" && (
          <section>
            <p className="eyebrow">YOUR DIRECTION</p>
            <h1>Goals</h1>
            <p className="muted">What do you want to achieve?</p>

            <div className="panel">
              <textarea
                value={goalInput}
                onChange={event => setGoalInput(event.target.value)}
                placeholder="Describe your goal..."
                rows="3"
              />
              <button onClick={addGoal}>INTERPRET GOAL</button>
            </div>

            {selectedGoal && (
              <div className="panel">
                <p className="eyebrow">EVIL GOAL ANALYSIS</p>
                <h2>{selectedGoal.title}</h2>
                <p>{selectedGoal.description}</p>
                <h3>WHAT THIS REQUIRES</h3>
                <ul>
                  {selectedGoal.requirements.map(item => <li key={item}>{item}</li>)}
                </ul>
                <p>Primary attribute: {selectedGoal.attribute}</p>
                <button onClick={() => activateGoal(selectedGoal)}>APPROVE & ACTIVATE</button>
                <button className="secondary-button" onClick={() => setSelectedGoal(null)}>CLOSE</button>
              </div>
            )}

            {data.goals.map(goal => (
              <div className="panel" key={goal.id}>
                <h3>{goal.title}</h3>
                <p>{goal.status} · {goal.progress}% progress</p>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${goal.progress}%` }} />
                </div>
              </div>
            ))}
          </section>
        )}

        {page === "Missions" && (
          <section>
            <p className="eyebrow">TAKE ACTION</p>
            <h1>Missions</h1>
            {data.missions.length === 0 && <p className="muted">No active missions. Activate a goal to begin.</p>}
            {data.missions.map(mission => (
              <div className="panel" key={mission.id}>
                <p className="eyebrow">{mission.status}</p>
                <h3>{mission.title}</h3>
                <p>{mission.description}</p>
                <p>Reward: {mission.xp} XP</p>
                {mission.status !== "Complete" && (
                  <button onClick={() => completeMission(mission)}>MARK COMPLETE</button>
                )}
              </div>
            ))}
          </section>
        )}

        {page === "Statistics" && (
          <section>
            <p className="eyebrow">YOUR PERFORMANCE</p>
            <h1>Statistics</h1>
            <div className="panel">
              <h2>{data.level}</h2><p>PLAYER LEVEL</p>
            </div>
            <div className="panel">
              <h2>{completedMissions}</h2><p>MISSIONS COMPLETED</p>
            </div>
            <div className="panel">
              <h2>{data.achievements.length}</h2><p>ACHIEVEMENTS EARNED</p>
            </div>
            <div className="panel">
              <h2>{data.goals.length}</h2><p>GOALS CREATED</p>
            </div>
            <h2>ACTIVITY HISTORY</h2>
            {data.history.map((item, index) => (
              <div className="panel" key={`${item.date}-${index}`}>
                <strong>{item.title}</strong>
                <p>{item.date} · +{item.xp} XP</p>
              </div>
            ))}
          </section>
        )}

        {page === "Achievements" && (
          <section>
            <p className="eyebrow">REWARDS & MILESTONES</p>
            <h1>Achievements</h1>
            {data.achievements.length === 0 && (
              <p className="muted">Your achievements will appear here when missions are completed.</p>
            )}
            {data.achievements.map(item => (
              <div className="panel" key={item.id}>
                <h3>✦ {item.title}</h3>
                <p>{item.description}</p>
                <p>{item.date} · +{item.xp} XP</p>
              </div>
            ))}
          </section>
        )}

        {page === "Settings" && (
          <section>
            <p className="eyebrow">SYSTEM CONFIGURATION</p>
            <h1>Settings</h1>
            <div className="panel">
              <label>PLAYER NAME</label>
              <input
                value={playerInput}
                onChange={event => setPlayerInput(event.target.value)}
              />
              <button onClick={updatePlayer}>SAVE PROFILE</button>
            </div>
            <div className="panel">
              <h3>RESET PROGRESS</h3>
              <p>This will erase your goals, missions and achievements from this browser.</p>
              <button className="danger-button" onClick={resetData}>RESET EVIL</button>
            </div>
          </section>
        )}
      </main>

      <nav className="bottom-nav">
        {navigation.map(item => (
          <button
            key={item}
            className={page === item ? "nav-item active" : "nav-item"}
            onClick={() => {
              setPage(item);
              setSelectedGoal(null);
            }}
          >
            {item}
          </button>
        ))}
      </nav>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
