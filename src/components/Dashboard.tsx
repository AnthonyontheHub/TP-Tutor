import { useMasteryStore } from '../store/masteryStore';
import ProgressSummary from './ProgressSummary';
import MasteryGrid from './MasteryGrid';

export default function Dashboard() {
  const studentName = useMasteryStore((s) => s.studentName);
  const curriculumLevel = useMasteryStore((s) => s.curriculumLevel);
  const lastUpdated = useMasteryStore((s) => s.lastUpdated);

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">TOKI PONA</h1>
          <p className="dashboard__subtitle">
            MASTERY MAP — {curriculumLevel.toUpperCase()}
          </p>
        </div>
        <div className="dashboard__header-right">
          <span className="dashboard__student">{studentName.toUpperCase()}</span>
          <span className="dashboard__date">SYNCED {lastUpdated}</span>
        </div>
      </header>

      <main className="dashboard__main">
        <ProgressSummary />
        <MasteryGrid />
      </main>

      <footer className="dashboard__footer">
        <button className="btn-start" disabled>
          ▶&nbsp;&nbsp;START SESSION
        </button>
      </footer>
    </div>
  );
}
