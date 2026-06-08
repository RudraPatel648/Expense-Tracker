import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import api from './api';
import './App.css';
import './auth.css';

// Helper to map backend categories to their corresponding CSS classes
const CATEGORY_COLORS = {
  Food: 'bg-lime',
  Transport: 'bg-sky',
  Shopping: 'bg-orange',
  Bills: 'bg-fuchsia',
  Entertainment: 'bg-butter',
  Other: 'bg-pink'
};

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Budget state (persisted in localStorage)
  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem('stacks_budget');
    return saved ? Number(saved) : 2500;
  });

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');

  // Filters & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Date ↓');

  // Fetch expenses from API
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/expenses');
      if (!res) return; // redirected to login
      if (!res.ok) {
        throw new Error(`Server returned an error: ${res.status}. Please check backend logs.`);
      }
      const data = await res.json();
      setExpenses(data.expenses || data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();    //Eslint Error
  },[]);

  // Handle adding a new expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount < 10) {
      alert('Minimum amount that can be tracked is 10');
      return;
    }

    try {
      const res = await api.post('/api/v1/expenses', {
        title: title.trim(),
        amount: parsedAmount,
        category
      });

      if (!res) return;
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || 'Failed to create expense');
      }

      const newExpense = await res.json();
      // Prepend to expenses list so it appears at the top
      setExpenses((prev) => [newExpense, ...prev]);

      // Reset form
      setTitle('');
      setAmount('');
      setCategory('Food');
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle deleting an expense
  const handleDeleteExpense = async (id) => {
    try {
      const res = await api.delete(`/api/v1/expenses/${id}`);
      if (!res) return;
      if (!res.ok) {
        throw new Error('Failed to delete expense');
      }

      setExpenses((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Change Budget Value
  const handleEditBudget = () => {
    const newBudget = prompt('Enter your monthly budget amount:', budget);
    if (newBudget !== null) {
      const parsed = Number(newBudget);
      if (!isNaN(parsed) && parsed > 0) {
        setBudget(parsed);
        localStorage.setItem('stacks_budget', parsed.toString());
      } else {
        alert('Please enter a valid positive number');
      }
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Calculate stats based on total expenses
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const left = budget - totalSpent;
  const progressPercent = budget > 0 ? Math.min(100, (totalSpent / budget) * 100) : 0;

  // Date/Days calculations
  const now = new Date();
  const currentDay = now.getDate();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = lastDayOfMonth - currentDay;

  const dailyAvg = currentDay > 0 ? Math.round(totalSpent / currentDay) : 0;
  const biggestHit = expenses.length > 0 ? Math.max(...expenses.map((e) => e.amount)) : 0;

  // Group allocations
  const initialAllocations = {
    Food: 0,
    Transport: 0,
    Shopping: 0,
    Bills: 0,
    Entertainment: 0,
    Other: 0
  };

  expenses.forEach((e) => {
    const cat = e.category || 'Other';
    if (initialAllocations[cat] !== undefined) {
      initialAllocations[cat] += e.amount;
    } else {
      initialAllocations.Other += e.amount;
    }
  });

  const totalAllocated = Object.values(initialAllocations).reduce((a, b) => a + b, 0);

  const rankedCategories = Object.keys(initialAllocations)
    .map((cat) => {
      const amt = initialAllocations[cat];
      const pct = totalAllocated > 0 ? Math.round((amt / totalAllocated) * 100) : 0;
      return { category: cat, amount: amt, percentage: pct };
    })
    .sort((a, b) => b.amount - a.amount);

  // Filter & Sort expenses locally
  const filteredExpenses = expenses
    .filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'Date ↓') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'Date ↑') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'Amount ↓') {
        return b.amount - a.amount;
      } else if (sortBy === 'Amount ↑') {
        return a.amount - b.amount;
      }
      return 0;
    });

  // Recent 5 expenses for the receipt
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const receiptTotal = recentExpenses.reduce((sum, item) => sum + item.amount, 0);

  const todayDateStr = now.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit'
  });

  return (
    <div>
      {/* NAV */}
      <nav className="nav">
        <div className="container nav__inner">
          <div className="brand">
            <div className="brand__logo">$</div>
            <span className="brand__name">STACKS</span>
          </div>
          <div className="nav__links">
            <a href="#budget">BUDGET</a>
            <a href="#allocation">ALLOCATION</a>
            <a href="#add">ADD</a>
            <a href="#expenses">LEDGER</a>
          </div>
          <div className="nav-user">
            <Link to="/profile" className="nav-user__name" id="nav-profile-link">
              HELLO, {user?.name?.toUpperCase() || 'USER'} ▼
            </Link>
            <a href="#add" className="btn btn--dark">+ ADD EXPENSE</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="container hero__grid">
          <div>
            <div className="badge bg-pink">v1.0 — NO BS MONEY TRACKER</div>
            <h1 className="hero__title">
              TRACK<br />
              YOUR <span className="hl bg-lime">CASH</span>.<br />
              SMASH<br />
              YOUR <span className="hl bg-butter">BUDGET</span>.
            </h1>
            <p className="hero__lede">
              A brutally honest expense tracker. No graphs that lie. No dark patterns.
              Just thick borders, fat shadows, and a budget bar that yells at you when
              you're about to do something stupid.
            </p>
            <div className="hero__ctas">
              <a href="#budget" className="btn btn--dark btn--lg">SEE MY BUDGET →</a>
              <a href="#add" className="btn btn--paper btn--lg">LOG EXPENSE</a>
            </div>
          </div>
          <div className="receipt">
            <div className="receipt__head">
              <span>RECEIPT #00042</span><span>{todayDateStr}</span>
            </div>
            <div className="receipt__rows">
              {recentExpenses.length > 0 ? (
                recentExpenses.map((e, idx) => (
                  <div key={e._id || idx}>
                    <span>{e.title}</span>
                    <b>${e.amount}</b>
                  </div>
                ))
              ) : (
                <div>
                  <span>No cash blown yet!</span>
                  <b>$0.00</b>
                </div>
              )}
            </div>
            <div className="receipt__total">
              <span>LATEST</span>
              <span className="receipt__num">${receiptTotal}</span>
            </div>
            <div className="barcode">
              <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
            </div>
          </div>
        </div>
      </section>

      {/* BUDGET */}
      <section id="budget" className="section bg-lime">
        <div className="container">
          <div className="section__head">
            <div>
              <p className="kicker">// SECTION 01</p>
              <h2 className="section__title">MONTHLY BUDGET</h2>
            </div>
            <button className="chip" onClick={handleEditBudget} style={{ cursor: 'pointer' }}>
              SET BUDGET: ${budget} ⚙️
            </button>
          </div>

          <div className="card card--xl">
            <div className="budget__top">
              <div>
                <p className="micro">SPENT</p>
                <p className="huge">${totalSpent}</p>
              </div>
              <div className="ta-right">
                <p className="micro">BUDGET</p>
                <p className="big">${budget}</p>
              </div>
            </div>

            <div className="progress">
              <div className="progress__fill" style={{ width: `${progressPercent}%` }}></div>
              <div className="progress__labels">
                <span>{Math.round(progressPercent)}% USED</span>
                <span>{left >= 0 ? `$${left} LEFT` : `$${Math.abs(left)} OVER BUDGET! 🛑`}</span>
              </div>
            </div>

            <div className="stats">
              <div className="stat bg-butter">
                <p className="micro">DAILY AVG</p>
                <p className="stat__num">${dailyAvg}</p>
              </div>
              <div className="stat bg-butter">
                <p className="micro">BIGGEST HIT</p>
                <p className="stat__num">${biggestHit}</p>
              </div>
              <div className="stat bg-butter">
                <p className="micro">DAYS LEFT</p>
                <p className="stat__num">{daysLeft}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ALLOCATION */}
      <section id="allocation" className="section">
        <div className="container">
          <div className="section__head">
            <div>
              <p className="kicker">// SECTION 02</p>
              <h2 className="section__title">ALLOCATION BREAKDOWN</h2>
              <p className="section__sub">Where your money actually went. No fancy donut chart — just the truth, stacked.</p>
            </div>
          </div>

          <div className="alloc__grid">
            <div className="card">
              <p className="micro mb">STACK VIEW</p>
              <div className="stackbar">
                {rankedCategories.map((item) => (
                  item.amount > 0 && (
                    <span
                      key={item.category}
                      className={CATEGORY_COLORS[item.category]}
                      style={{ width: `${item.percentage}%` }}
                      title={`${item.category}: ${item.percentage}%`}
                    ></span>
                  )
                ))}
                {totalAllocated === 0 && (
                  <span className="bg-pink" style={{ width: '100%' }} title="No expenses logged"></span>
                )}
              </div>
              <div className="legend">
                {Object.keys(CATEGORY_COLORS).map((cat) => {
                  const amt = initialAllocations[cat];
                  const pct = totalAllocated > 0 ? Math.round((amt / totalAllocated) * 100) : 0;
                  return (
                    <div key={cat}>
                      <i className={CATEGORY_COLORS[cat]}></i>
                      <b>{cat}</b>
                      <span>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card">
              <p className="micro mb">RANKED</p>
              <ul className="rank">
                {rankedCategories.map((item, idx) => (
                  <li key={item.category}>
                    <div>
                      <span>#{String(idx + 1).padStart(2, '0')} {item.category.toUpperCase()}</span>
                      <b>${item.amount}</b>
                    </div>
                    <div className="rank__bar">
                      <span className={CATEGORY_COLORS[item.category]} style={{ width: `${item.percentage}%` }}></span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ADD */}
      <section id="add" className="section bg-pink">
        <div className="container">
          <div className="section__head">
            <div>
              <p className="kicker">// SECTION 03</p>
              <h2 className="section__title">LOG AN EXPENSE</h2>
              <p className="section__sub">Be honest. Past you spent the money — present you has to write it down.</p>
            </div>
          </div>

          <form className="card form" onSubmit={handleAddExpense}>
            <div>
              <label className="micro">TITLE</label>
              <input
                type="text"
                placeholder="what'd you blow it on?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={20}
                required
              />
            </div>
            <div>
              <label className="micro">AMOUNT ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="micro">CATEGORY</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {Object.keys(CATEGORY_COLORS).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn--dark">+ ADD</button>
          </form>
        </div>
      </section>

      {/* LEDGER */}
      <section id="expenses" className="section bg-sky">
        <div className="container">
          <div className="section__head">
            <div>
              <p className="kicker">// SECTION 04</p>
              <h2 className="section__title">THE LEDGER</h2>
            </div>
          </div>

          <div className="card filters">
            <div>
              <label className="micro">SEARCH</label>
              <input
                type="text"
                placeholder="hunt an expense..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="micro">FILTER BY</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="All">All</option>
                {Object.keys(CATEGORY_COLORS).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="micro">SORT BY</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option>Date ↓</option>
                <option>Date ↑</option>
                <option>Amount ↓</option>
                <option>Amount ↑</option>
              </select>
            </div>
          </div>

          <div className="ledger">
            <div className="ledger__head">
              <span>TITLE</span>
              <span>CATEGORY</span>
              <span>DATE</span>
              <span className="ta-right">AMOUNT</span>
              <span className="ta-right">DEL</span>
            </div>
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace' }}>
                LOADING DATA...
              </div>
            ) : error ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#ff8aa8', fontWeight: 'bold' }}>
                ERROR: {error}
              </div>
            ) : filteredExpenses.length > 0 ? (
              filteredExpenses.map((item) => (
                <div className="ledger__row" key={item._id}>
                  <div>
                    <p>{item.title}</p>
                  </div>
                  <span className={`tag ${CATEGORY_COLORS[item.category] || 'bg-pink'}`}>
                    {(item.category || 'OTHER').toUpperCase()}
                  </span>
                  <span className="date">
                    {item.createdAt ? item.createdAt.slice(0, 10) : 'N/A'}
                  </span>
                  <span className="amount">${item.amount}</span>
                  <button
                    className="del"
                    aria-label="Delete"
                    onClick={() => handleDeleteExpense(item._id)}
                  >
                    🗑
                  </button>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace' }}>
                NO EXPENSES FOUND MATCHING YOUR CRITERIA.
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer__inner">
          <span><b>© 2026 STACKS — TRACK HARD.</b></span>
          <span>BUILT WITH THICK BORDERS AND BAD ATTITUDE.</span>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
