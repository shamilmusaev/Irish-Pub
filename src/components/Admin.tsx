import React, { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, addDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import '../styles/Admin.css';

interface Match {
  id: string;
  league: string;
  team1: string;
  team2: string;
  date: string;
  time: string;
}

interface Band {
  id: string;
  name: string;
  genre: string;
  date: string;
  time: string;
}

const LEAGUES = [
  "Premier League",
  "Champions League",
  "Europa League",
  "La Liga",
  "Bundesliga",
  "Serie A",
  "Six Nations Rugby",
  "Champions Cup Rugby",
  "GAA Football",
  "GAA Hurling"
];

const GENRES = [
  "Rock",
  "Pop",
  "Jazz",
  "Blues",
  "Folk",
  "Traditional Irish",
  "Country",
  "Electronic"
];

const TEAMS = {
  "Premier League": [
    "Arsenal",
    "Aston Villa",
    "Brighton",
    "Burnley",
    "Chelsea",
    "Crystal Palace",
    "Everton",
    "Fulham",
    "Liverpool",
    "Luton",
    "Manchester City",
    "Manchester United",
    "Newcastle",
    "Nottingham Forest",
    "Sheffield United",
    "Tottenham",
    "West Ham",
    "Wolves"
  ],
  "La Liga": [
    "Real Madrid",
    "Barcelona",
    "Atletico Madrid",
    "Real Sociedad",
    "Athletic Bilbao",
    "Real Betis",
    "Valencia",
    "Sevilla"
  ],
  "Champions League": [
    "Real Madrid",
    "Manchester City",
    "Bayern Munich",
    "PSG",
    "Inter Milan",
    "Barcelona",
    "Arsenal",
    "Manchester United",
    "Newcastle United",
    "AC Milan"
  ]
};

const Admin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminMode, setAdminMode] = useState<'matches' | 'bands'>('matches');
  const [matches, setMatches] = useState<Match[]>([]);
  const [bands, setBands] = useState<Band[]>([]);
  const [newMatch, setNewMatch] = useState({
    league: '',
    team1: '',
    team2: '',
    date: '',
    time: ''
  });
  const [newBand, setNewBand] = useState({
    name: '',
    genre: '',
    date: '',
    time: ''
  });
  const [selectedLeague, setSelectedLeague] = useState('');
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [inputMode, setInputMode] = useState({
    team1: 'select',
    team2: 'select'
  });

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true);
        fetchMatches();
        fetchBands();
      } else {
        setIsLoggedIn(false);
      }
    });
  }, []);

  const fetchBands = async () => {
    const bandsCollection = collection(db, 'bands');
    const bandsSnapshot = await getDocs(bandsCollection);
    const bandsList = bandsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Band[];
    setBands(bandsList.sort((a, b) => {
      const dateA = new Date(a.date + 'T' + a.time);
      const dateB = new Date(b.date + 'T' + b.time);
      return dateA.getTime() - dateB.getTime();
    }));
  };

  const handleAddBand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newBand.name || !newBand.genre || !newBand.date || !newBand.time) {
        alert('Please fill in all fields');
        return;
      }
      await addDoc(collection(db, 'bands'), newBand);
      setNewBand({ name: '', genre: '', date: '', time: '' });
      fetchBands();
    } catch (error) {
      console.error('Error adding band:', error);
      alert('Error adding band');
    }
  };

  const handleDeleteBand = async (bandId: string) => {
    if (window.confirm('Are you sure you want to delete this band?')) {
      try {
        await deleteDoc(doc(db, 'bands', bandId));
        fetchBands();
      } catch (error) {
        console.error('Error deleting band:', error);
        alert('Error deleting band');
      }
    }
  };

  useEffect(() => {
    if (selectedLeague) {
      setFilteredMatches(matches.filter(match => match.league === selectedLeague));
    } else {
      setFilteredMatches(matches);
    }
  }, [selectedLeague, matches]);

  const fetchMatches = async () => {
    const matchesCollection = collection(db, 'matches');
    const matchesSnapshot = await getDocs(matchesCollection);
    const matchesList = matchesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Match[];
    setMatches(matchesList.sort((a, b) => {
      const dateA = new Date(a.date + 'T' + a.time);
      const dateB = new Date(b.date + 'T' + b.time);
      return dateA.getTime() - dateB.getTime();
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsLoggedIn(true);
    } catch (error: any) {
      console.error('Login error:', error);
      alert(error.message || 'Failed to login. Please check your credentials.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
    } catch (error: any) {
      console.error('Logout error:', error);
      alert(error.message || 'Failed to logout.');
    }
  };

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newMatch.league || !newMatch.team1 || !newMatch.team2 || !newMatch.date || !newMatch.time) {
        alert('Please fill in all fields');
        return;
      }
      await addDoc(collection(db, 'matches'), newMatch);
      setNewMatch({ league: newMatch.league, team1: '', team2: '', date: '', time: '' });
      fetchMatches();
    } catch (error) {
      console.error('Error adding match:', error);
      alert('Error adding match');
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      try {
        await deleteDoc(doc(db, 'matches', matchId));
        fetchMatches();
      } catch (error) {
        console.error('Error deleting match:', error);
        alert('Error deleting match');
      }
    }
  };

  const toggleInputMode = (team: 'team1' | 'team2') => {
    setInputMode(prev => ({
      ...prev,
      [team]: prev[team] === 'select' ? 'input' : 'select'
    }));
    setNewMatch(prev => ({
      ...prev,
      [team]: ''
    }));
  };

  const renderTeamInput = (team: 'team1' | 'team2') => {
    const isSelect = inputMode[team] === 'select';
    const teamsList = TEAMS[newMatch.league as keyof typeof TEAMS] || [];
    const otherTeam = team === 'team1' ? newMatch.team2 : newMatch.team1;

    return (
      <div className="team-input-container">
        <div className="input-toggle">
          {isSelect ? (
            <select
              value={newMatch[team]}
              onChange={(e) => setNewMatch({ ...newMatch, [team]: e.target.value })}
              className="team-select"
            >
              <option value="">Select {team === 'team1' ? 'Home' : 'Away'} Team</option>
              {teamsList
                .filter(t => t !== otherTeam)
                .map(teamName => (
                  <option key={teamName} value={teamName}>{teamName}</option>
                ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder={`${team === 'team1' ? 'Home' : 'Away'} Team`}
              value={newMatch[team]}
              onChange={(e) => setNewMatch({ ...newMatch, [team]: e.target.value })}
              className="team-input"
            />
          )}
          <button
            type="button"
            onClick={() => toggleInputMode(team)}
            className="toggle-input-mode"
          >
            {isSelect ? 'Type Team' : 'Select Team'}
          </button>
        </div>
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login">
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Admin Panel</h2>
        <div className="admin-mode-switcher">
          <button
            onClick={() => setAdminMode('matches')}
            className={adminMode === 'matches' ? 'active' : ''}
          >
            Matches
          </button>
          <button
            onClick={() => setAdminMode('bands')}
            className={adminMode === 'bands' ? 'active' : ''}
          >
            Live Music
          </button>
        </div>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      {adminMode === 'matches' ? (
        <>
          <div className="add-match-form">
            <h3>Add New Match</h3>
            <form onSubmit={handleAddMatch}>
              <select
                value={newMatch.league}
                onChange={(e) => {
                  setNewMatch({ 
                    ...newMatch, 
                    league: e.target.value,
                    team1: '',
                    team2: ''
                  });
                  setInputMode({ team1: 'select', team2: 'select' });
                }}
                className="league-select"
              >
                <option value="">Select League</option>
                {LEAGUES.map(league => (
                  <option key={league} value={league}>{league}</option>
                ))}
              </select>

              {newMatch.league && (
                <>
                  {renderTeamInput('team1')}
                  {renderTeamInput('team2')}
                </>
              )}

              <input
                type="date"
                value={newMatch.date}
                onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
              />
              <input
                type="time"
                value={newMatch.time}
                onChange={(e) => setNewMatch({ ...newMatch, time: e.target.value })}
              />
              <button type="submit">Add Match</button>
            </form>
          </div>

          <div className="matches-list">
            <h3>Current Matches</h3>
            <div className="matches-filter">
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="league-filter"
              >
                <option value="">All Leagues</option>
                {LEAGUES.map(league => (
                  <option key={league} value={league}>{league}</option>
                ))}
              </select>
            </div>
            {filteredMatches.map((match) => (
              <div key={match.id} className="match-item">
                <div className="match-info">
                  <div className="match-league">{match.league}</div>
                  <div className="match-teams">{match.team1} vs {match.team2}</div>
                  <div className="match-datetime">
                    {new Date(match.date).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} - {match.time}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteMatch(match.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="add-band-form">
            <h3>Add New Band</h3>
            <form onSubmit={handleAddBand}>
              <input
                type="text"
                placeholder="Band Name"
                value={newBand.name}
                onChange={(e) => setNewBand({ ...newBand, name: e.target.value })}
              />
              <select
                value={newBand.genre}
                onChange={(e) => setNewBand({ ...newBand, genre: e.target.value })}
              >
                <option value="">Select Genre</option>
                {GENRES.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
              <input
                type="date"
                value={newBand.date}
                onChange={(e) => setNewBand({ ...newBand, date: e.target.value })}
              />
              <input
                type="time"
                value={newBand.time}
                onChange={(e) => setNewBand({ ...newBand, time: e.target.value })}
              />
              <button type="submit">Add Band</button>
            </form>
          </div>

          <div className="bands-list">
            <h3>Upcoming Bands</h3>
            {bands.map((band) => (
              <div key={band.id} className="band-item">
                <div className="band-info">
                  <div className="band-name">{band.name}</div>
                  <div className="band-genre">{band.genre}</div>
                  <div className="band-datetime">
                    {new Date(band.date).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} - {band.time}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteBand(band.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Admin;
