import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import api from '../../services/api';
import homeicon from '../../images/loho-corona-beer.jpg';

const formatMoney = (value) => `₹ ${Number(value || 0).toLocaleString('en-IN')}`;

const TeamPage = () => {
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState({ teamSize: 0, teamRecharge: 0, levels: [] });
  const [error, setError] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(1);

  useEffect(() => {
    let active = true;

    const loadTeam = async () => {
      try {
        setLoading(true);
        const response = await api.get('/auth/team');
        if (!active) {
          return;
        }

        setTeam({
          teamSize: response.data?.teamSize || 0,
          teamRecharge: response.data?.teamRecharge || 0,
          levels: response.data?.levels || [],
        });
      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(requestError?.response?.data?.message || 'Unable to load team data');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadTeam();

    return () => {
      active = false;
    };
  }, []);

  const levelCards = useMemo(
    () =>
      team.levels.map((level) => ({
        label: `LV:${level.level}`,
        note: `${Math.round((level.rate || 0) * 100)}% · ${level.count} users`,
        active: level.level === selectedLevel,
        level: level.level,
      })),
    [team.levels, selectedLevel]
  );

  return (
    <main className="screen-shell">
      <header className="mobile-topbar">
        <Link to="/home" className="mobile-topbar__back" aria-label="Back to home">
          <span>‹</span>
        </Link>
        <h1>Team</h1>
      </header>

      <section className="page-card page-card--tight team-page">
        <div className="team-summary">
          <div>
            <p className="team-kicker">TEAM RECHARGE</p>
            <div className="team-balance">{formatMoney(team.teamRecharge)}</div>
            <div className="team-divider" />
            <h2>Team size : {team.teamSize}</h2>
          </div>
          <div className="team-avatar">
            <img src={homeicon} alt="Team Avatar" />
          </div>
        </div>

        <div className="team-levels">
          {levelCards.map((level) => (
            <button
              key={level.label}
              type="button"
              className={`team-level ${level.active ? 'is-active' : ''}`}
              onClick={() => setSelectedLevel(level.level)}
            >
              <span>{level.label}</span>
              <small>({level.note})</small>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="team-empty-state">LOADING</div>
        ) : error ? (
          <div className="team-empty-state">{error}</div>
        ) : team.levels.length ? (
          <div className="team-history-list">
            {(() => {
              const active = team.levels.find((l) => l.level === selectedLevel);
              if (!active) {
                return <div className="team-empty-state">NO DATA</div>;
              }

              const level = active;
              return (
                <section key={level.level} className="team-history-card">
                  <div className="team-history-card__header">
                    <div>
                      <p>Level {level.level}</p>
                      <h3>{level.count} members</h3>
                    </div>
                    <strong>{formatMoney(level.totalRecharge)}</strong>
                  </div>

                  {level.members.length ? (
                    <div className="team-member-list">
                      {level.members.map((member) => (
                        <div key={member.id} className="team-member-row">
                          <div>
                            <span>{member.phone}</span>
                            <small>{member.referralCode || 'No referral code'}</small>
                          </div>
                          <strong>{formatMoney(member.totalRecharge)}</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="team-empty-state team-empty-state--compact">NO DATA</div>
                  )}
                </section>
              );
            })()}
          </div>
        ) : (
          <div className="team-empty-state">NO DATA</div>
        )}
      </section>

      <BottomNav activeTab="team" />
    </main>
  );
};

export default TeamPage;
