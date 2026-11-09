
import React, { useState, useEffect } from "react";
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

function App() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem("evil-save");
      return saved ? JSON.parse(saved) : {
        playerName: "Player",
        level: 1,
        xp: 0,
        attributes: startingAttributes,
        goals: [],
        missions: [],
        achievements: []
      };
    } catch {
      return {
        playerName: "Player",
        level: 1,
        xp: 0,
        attributes: startingAttributes,
        goals: [],
        missions: [],
        achievements: []
      };
    }
  });

  const [page, setPage] = useState("Profile");
  const [goalInput, setGoalInput] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [pendingGoal, setPendingGoal] = useState("");

  useEffect(() => {
    localStorage.setItem("evil-save", JSON.stringify(data));
  }, [data]);

  function interpretGoal(goal) {
    const words = goal.toLowerCase();

    if (words.includes("fitness") || words.includes("strong") || words.includes("muscle")) {
      return "This goal involves consistent physical training, recovery, nutrition and measurable improvements in strength and fitness.";
    }

    if (words.includes("money") || words.includes("save") || words.includes("financial")) {
      return "This goal involves understanding your finances, setting a realistic target, managing spending and regularly tracking savings.";
    }

    if (words.includes("business") || words.includes("career") || words.includes("professional")) {
      return "This goal involves developing relevant skills, gaining experience, building a strong reputation and taking consistent steps towards your chosen career.";
    }

    if (words.includes("learn") || words.includes("study") || words.includes("skill")) {
      return "This goal involves structured learning, regular practice, applying new knowledge and measuring your improvement.";
    }

    return "This goal requires a clear outcome, consistent action, the right resources and measurable milestones. EVIL will help turn it into a practical progression plan.";
  }

  function reviewGoal() {
    if (!goalInput.trim()) return;
    setPendingGoal(goalInput.trim());
    setGoalDescription(interpretGoal(goalInput));
  }

  function activateGoal() {
    const goal = {
      id: Date.now(),
      title: pendingGoal,
      description: goalDescription,
      status: "Active",
      created: new Date().toLocaleDateString()
    };

    setData(prev => ({
      ...prev,
      goals: [...prev.goals, goal],
      missions: [
        ...prev.missions,
        {
          id: Date.now() + 1,
          goalId: goal.id,
          title: `First step: ${pendingGoal}`,
          description: "Define and complete one practical action towards this goal.",
          status: "Active",
          xp: 25
        }
      ]
    }));

    setGoalInput("");
    setPendingGoal("");
    setGoalDescription("");
    setPage("Goals");
  }

  function completeMission(mission) {
    if (mission.status === "Completed") return;

    setData(prev => {
      const newXP = prev.xp + mission.xp;
      const newLevel = Math.floor(newXP / 1000) + 1;
      const newAchievement = {
        id: Date.now(),
        title: "Mission completed",
        description: mission.title,
        date: new Date().toLocaleDateString(),
        xp: mission.xp
      };

      return {
        ...prev,
        xp: newXP % 1000,
        level: newLevel,
        missions: prev.missions.map(item =>
          item.id === mission.id
            ? { ...item, status: "Completed" }
            : item
        ),
        achievements: [...prev.achievements, newAchievement]
      };
    });
  }

  function updateName(value) {
    setData(prev => ({ ...prev, playerName: value }));
  }

  const completed = data.missions.filter(m => m.status === "Completed").length;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">EVIL<span> ✦</span></div>
        <div className="level">LEVEL {data.level}</div>
      </header>

      <main>
        {page === "Profile" && (
          <section>
            <p className="eyebrow">PLAYER PROFILE</p>
            <h1>YOUR NEXT VERSION.</h1>

            <div className="panel">
              <label>PLAYER NAME</label>
              <input
                value={data.playerName}
                onChange={e => updateName(e.target.value)}
              />
              <div className="profile-level">LEVEL {data.level}</div>
              <p>{data.xp} / 1000 XP</p>
              <div className="xp-track">
                <div style={{ width: `${data.xp / 10}%` }} />
              </div>
            </div>

            <h2>CORE ATTRIBUTES</h2>
            <div className="panel">
              {Object.entries(data.attributes).map(([name, value]) => (
                <div className="attribute" key={name}>
                  <div className="attribute-heading">
                    <span>{name}</span><span>{value}/100</span>
                  </div>
                  <div className="xp-track">
                    <div style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {page === "Goals" && (
          <section>
            <p className="eyebrow">YOUR DIRECTION</p>
            <h1>GOALS</h1>

            <div className="panel">
              <h2>CREATE A GOAL</h2>
              <input
                placeholder="What do you want to achieve?"
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
              />
              <button onClick={reviewGoal}>ANALYSE GOAL</button>
            </div>

            {pendingGoal && (
              <div className="panel">
                <p className="eyebrow">EVIL INTERPRETATION</p>
                <h2>{pendingGoal}</h2>
                <p>{goalDescription}</p>
                <p>Review this interpretation before activating your goal.</p>
                <button onClick={activateGoal}>APPROVE & ACTIVATE</button>
                <button className="secondary" onClick={() => {
                  setPendingGoal("");
                  setGoalDescription("");
                }}>CANCEL</button>
              </div>
            )}

            {data.goals.map(goal => (
              <div className="panel" key={goal.id}>
                <span className="status">{goal.status}</span>
                <h2>{goal.title}</h2>
                <p>{goal.description}</p>
              </div>
            ))}
            {data.goals.length === 0 && <p>No active goals yet.</p>}
          </section>
        )}

        {page === "Missions" && (
          <section>
            <p className="eyebrow">TAKE ACTION</p>
            <h1>MISSIONS</h1>
            {data.missions.map(mission => (
              <div className="panel" key={mission.id}>
                <span className="status">{mission.status}</span>
                <h2>{mission.title}</h2>
                <p>{mission.description}</p>
                <p>REWARD: {mission.xp} XP</p>
                {mission.status !== "Completed" && (
                  <button onClick={() => completeMission(mission)}>
                    COMPLETE MISSION
                  </button>
                )}
              </div>
            ))}
            {data.missions.length === 0 && <p>Your missions will appear here.</p>}
          </section>
        )}

        {page === "Statistics" && (
          <section>
            <p className="eyebrow">YOUR PROGRESSION</p>
            <h1>STATISTICS</h1>
            <div className="panel">
              <h2>{data.level}</h2><p>PLAYER LEVEL</p>
              <h2>{completed}</h2><p>MISSIONS COMPLETED</p>
              <h2>{data.goals.length}</h2><p>GOALS CREATED</p>
              <h2>{data.achievements.length}</h2><p>ACHIEVEMENTS EARNED</p>
            </div>
          </section>
        )}

        {page === "Achievements" && (
          <section>
            <p className="eyebrow">MILESTONES & RECORDS</p>
            <h1>ACHIEVEMENTS</h1>
            {data.achievements.map(item => (
              <div className="panel" key={item.id}>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <p>{item.date} · +{item.xp} XP</p>
              </div>
            ))}
            {data.achievements.length === 0 && <p>Your achievements will be recorded here.</p>}
          </section>
        )}

        {page === "Settings" && (
          <section>
            <p className="eyebrow">SYSTEM</p>
            <h1>SETTINGS</h1>
            <div className="panel">
              <h2>EVIL DATA</h2>
              <p>Your current progress is saved locally in this browser.</p>
              <button className="secondary" onClick={() => {
                if (window.confirm("Reset all EVIL progress? This cannot be undone.")) {
                  localStorage.removeItem("evil-save");
                  window.location.reload();
                }
              }}>RESET PROGRESS</button>
            </div>
          </section>
        )}
      </main>

      <nav className="bottom-nav">
        {["Profile", "Goals", "Missions", "Statistics", "Achievements", "Settings"].map(item => (
          <button
            key={item}
            className={page === item ? "selected" : ""}
            onClick={() => setPage(item)}
          >
            {item}
          </button>
        ))}
      </nav>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
