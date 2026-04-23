import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import SearchPage from './pages/SearchPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="app-nav">
          <div className="nav-container">
            <NavLink to="/" className="nav-brand">
              📚 LibrarySearch
            </NavLink>
            <div className="nav-links">
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                🔍 Search
              </NavLink>
              <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                ⚙️ Admin
              </NavLink>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
