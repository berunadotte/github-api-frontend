import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [repositories, setRepositories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchType, setSearchType] = useState('name');
  const [error, setError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      const response = await axios.get('http://localhost:3000/repositories');
      setRepositories(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching repositories:', error);
      setError('Failed to fetch repositories.');
    }
  };

  const handleSearch = async () => {
    try {
      const response = searchType === 'name'
        ? await axios.get('http://localhost:3000/search', { params: { name: searchTerm } })
        : await axios.get(`http://localhost:3000/repositories/${searchTerm}`);
      setSearchResult(response.data);
      setError('');
    } catch (error) {
      console.error('Error searching repository:', error);
      setSearchResult(null);
      setError('Repository not found.');
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      await axios.post('http://localhost:3000/sync');
      fetchRepositories();
      setIsSyncing(false);
    } catch (error) {
      console.error('Error syncing repositories:', error);
      setError('Failed to sync repositories.');
      setIsSyncing(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="app">
      <h1 className="app__title">Trending GitHub Repositories</h1>
      <div className="sync">
        <button className="sync__button" onClick={handleSync} disabled={isSyncing}>
          {isSyncing ? 'Syncing...' : 'Sync'}
        </button>
        {isSyncing && <div className="sync__animation">Syncing in progress...</div>}
      </div>
      <div className="search">
        <input
          className="search__input"
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search by repository name or ID"
        />
        <select className="search__select" value={searchType} onChange={e => setSearchType(e.target.value)}>
          <option value="name">Name</option>
          <option value="id">ID</option>
        </select>
        <button className="search__button" onClick={handleSearch}>Search</button>
      </div>
      {error && <div className="error">{error}</div>}
      {searchResult ? (
        <div className="search-result">
          <h2 className="search-result__title">Search Result</h2>
          <a className="search-result__link" href={searchResult.url}>{searchResult.name}</a> - {searchResult.stars} stars
        </div>
      ) : (
        <>
          <h2 className="app__subtitle">All Repositories</h2>
          <ul className="repository-list">
            {repositories.map(repo => (
              <li className="repository-list__item" key={repo._id}>
                <a className="repository-list__link" href={repo.url}>{repo.name}</a> - {repo.stars} stars
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
