import { useState } from "react";
import axios from "axios";
import "./App.css";

/**
 * Optional backend (Express server.js + MongoDB).
 * When VITE_API_URL is set at build time the form posts to `${API}/api/feedback`.
 * When it is not set (the Vercel default) the response is stored in the browser,
 * so the deployed page works with zero backend setup.
 */
const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const STORAGE_KEY = "feedback-system-responses-v1";

const EMPTY_FORM = { q1: "", q2: "", q3: "", q4: "", q5: "" };

function readSaved() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function formatWhen(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function App() {
  const [feedback, setFeedback] = useState(EMPTY_FORM);
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | sending | done
  const [notice, setNotice] = useState("");
  const [saved, setSaved] = useState(() => readSaved());
  const [showSaved, setShowSaved] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFeedback((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFeedback(EMPTY_FORM);
    setRating(0);
  };

  const persist = (entry) => {
    const next = [entry, ...readSaved()].slice(0, 50);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage full or blocked - the form still submits */
    }
    setSaved(next);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const entry = {
      ...feedback,
      rating: rating || null,
      submittedAt: new Date().toISOString(),
    };

    setStatus("sending");
    setNotice("");

    let message = "Feedback submitted successfully. Thank you!";

    if (API) {
      try {
        const response = await axios.post(`${API}/api/feedback`, entry);
        message = response.data?.message || message;
      } catch (error) {
        console.error(
          "Feedback API error:",
          error.response?.data || error.message
        );
        message =
          "Saved in this browser. The server could not be reached, so it was not synced.";
      }
    }

    persist(entry);
    resetForm();
    setNotice(message);
    setStatus("done");
  };

  const clearSaved = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSaved([]);
  };

  return (
    <main className="page">
      <section className="card">
        <header className="card-head">
          <span className="logo" aria-hidden="true">
            💬
          </span>
          <div>
            <h1>Feedback System</h1>
            <p className="sub">
              Share your feedback about a session. It takes 30 seconds.
            </p>
          </div>
        </header>

        {status === "done" ? (
          <div className="success">
            <div className="tick" aria-hidden="true">
              ✅
            </div>
            <h2>Response recorded</h2>
            <p>{notice}</p>
            <div className="success-actions">
              <button
                type="button"
                className="primary"
                onClick={() => {
                  setStatus("idle");
                  setNotice("");
                }}
              >
                Submit another response
              </button>
              {saved.length > 0 && (
                <button
                  type="button"
                  className="ghost"
                  onClick={() => {
                    setStatus("idle");
                    setShowSaved(true);
                  }}
                >
                  View responses ({saved.length})
                </button>
              )}
            </div>
          </div>
        ) : (
          <form className="form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="q1">Name</label>
              <input
                id="q1"
                name="q1"
                type="text"
                value={feedback.q1}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="q2">Department</label>
              <input
                id="q2"
                name="q2"
                type="text"
                value={feedback.q2}
                onChange={handleChange}
                placeholder="e.g. CSE, IT, ECE"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="q3">Session title</label>
              <input
                id="q3"
                name="q3"
                type="text"
                value={feedback.q3}
                onChange={handleChange}
                placeholder="Topic of the session"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="q4">Feedback</label>
              <textarea
                id="q4"
                name="q4"
                rows={3}
                value={feedback.q4}
                onChange={handleChange}
                placeholder="What worked well?"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="q5">Suggestions (optional)</label>
              <textarea
                id="q5"
                name="q5"
                rows={2}
                value={feedback.q5}
                onChange={handleChange}
                placeholder="Anything that could be improved?"
              />
            </div>

            <div className="field">
              <label id="rating-label">Overall rating (optional)</label>
              <div
                className="stars"
                role="group"
                aria-labelledby="rating-label"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={value <= rating ? "star on" : "star"}
                    aria-label={`${value} star${value > 1 ? "s" : ""}`}
                    aria-pressed={value === rating}
                    onClick={() =>
                      setRating((current) => (current === value ? 0 : value))
                    }
                  >
                    ★
                  </button>
                ))}
                <span className="star-hint">
                  {rating ? `${rating} / 5` : "Tap to rate"}
                </span>
              </div>
            </div>

            <button
              className="primary submit"
              type="submit"
              disabled={status === "sending"}
            >
              {status === "sending" ? "Submitting..." : "Submit feedback"}
            </button>

            <p className="mode">
              {API
                ? "Connected to the feedback API configured for this build."
                : "Responses are stored in this browser. Set VITE_API_URL to sync them with the Express + MongoDB backend."}
            </p>
          </form>
        )}
      </section>

      {saved.length > 0 && (
        <section className="saved">
          <button
            type="button"
            className="saved-toggle"
            onClick={() => setShowSaved((open) => !open)}
            aria-expanded={showSaved}
          >
            <span>Recent responses in this browser</span>
            <span className="pill">{saved.length}</span>
          </button>

          {showSaved && (
            <div className="saved-body">
              <ul className="saved-list">
                {saved.slice(0, 5).map((entry, index) => (
                  <li key={`${entry.submittedAt}-${index}`}>
                    <div className="saved-top">
                      <strong>{entry.q1 || "Anonymous"}</strong>
                      <span className="when">
                        {formatWhen(entry.submittedAt)}
                      </span>
                    </div>
                    <div className="saved-meta">
                      {entry.q2 || "No department"}
                      {" · "}
                      {entry.q3 || "No session"}
                      {entry.rating ? ` · ${"★".repeat(entry.rating)}` : ""}
                    </div>
                    <p className="saved-text">{entry.q4}</p>
                  </li>
                ))}
              </ul>
              <button type="button" className="ghost" onClick={clearSaved}>
                Clear stored responses
              </button>
            </div>
          )}
        </section>
      )}

      <footer className="foot">
        FSWD Exercise 3 · Feedback System · React + Vite on Vercel
      </footer>
    </main>
  );
}
