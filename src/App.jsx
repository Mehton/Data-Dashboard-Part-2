import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import ComicsList from "./Components/ComicsList";

const API_KEY = import.meta.env.VITE_APP_API_KEY;
const PRIVATE_API_KEY = import.meta.env.VITE_SERVER_API_KEY;
import "./App.css";
import md5 from "crypto-js/md5";

const App = () => {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [selectedComicType, setSelectedComicType] = useState(""); // New filter
  const [totalComics, setTotalComics] = useState(0);
  const [averageComicsPerCharacter, setAverageComicsPerCharacter] = useState(0);
  const [medianComicsPerCharacter, setMedianComicsPerCharacter] = useState(0);
  const [modeComicsPerCharacter, setModeComicsPerCharacter] = useState(0);
  const [currentChart, setCurrentChart] = useState("bar");
  const publicKey = API_KEY;
  const privateKey = PRIVATE_API_KEY;

  useEffect(() => {
    const fetchComics = async () => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const hash = md5(timestamp + privateKey + publicKey).toString();
      const url = `https://gateway.marvel.com:443/v1/public/comics?apikey=${publicKey}&ts=${timestamp}&hash=${hash}&limit=100`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.code === 200) {
          const comicsData = data.data.results;

          // Filter comics to include only those with 1 or more characters and exclude "Marvel Previews (2017)"
          const filteredComicsData = comicsData.filter(
            (comic) =>
              comic.characters.available > 0 &&
              comic.title !== "Marvel Previews (2017)"
          );

          setComics(filteredComicsData);
          setTotalComics(filteredComicsData.length);
          setAverageComicsPerCharacter(
            filteredComicsData.reduce(
              (acc, comic) => acc + comic.characters.available,
              0
            ) / filteredComicsData.length
          );
          setMedianComicsPerCharacter(
            calculateMedian(
              filteredComicsData.map((comic) => comic.characters.available)
            )
          );
          setModeComicsPerCharacter(
            calculateMode(
              filteredComicsData.map((comic) => comic.characters.available)
            )
          );
        } else {
          console.error("Error fetching comics:", data.status);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComics();
  }, []);

  const calculateMedian = (numbers) => {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const toggleChart = () => {
    setCurrentChart(currentChart === "bar" ? "line" : "bar");
  };

  const characterData = comics.map((comic) => ({
    title: comic.title,
    characters: comic.characters.available,
  }));

  const calculateMode = (numbers) => {
    const frequency = {};
    numbers.forEach((num) => (frequency[num] = (frequency[num] || 0) + 1));
    const maxFreq = Math.max(...Object.values(frequency));
    const modes = Object.keys(frequency).filter(
      (num) => frequency[num] === maxFreq
    );
    return modes.length === 1 ? modes[0] : modes; // Return as array if multiple modes
  };

  const filteredComics = comics.filter((comic) => {
    return (
      comic.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCharacter
        ? comic.characters.items.some(
            (character) => character.name === selectedCharacter
          )
        : true) &&
      (selectedComicType ? comic.type === selectedComicType : true)
    );
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Marvel Comics</h1>
      </header>

      <nav className="navbar">
        <ul>
          <li>
            <Link style={{ color: "white" }} to="/">
              Home
            </Link>
          </li>
        </ul>
      </nav>

      <div className="stats">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="card" style={{ flexDirection: "column" }}>
              <h2>Total Comics: {totalComics}</h2>
              <h3>
                Average Comics per Character:{" "}
                {averageComicsPerCharacter.toFixed(2)}
              </h3>
              <h3>Median Comics per Character: {medianComicsPerCharacter}</h3>
              <h3>
                Mode Comics per Character:{" "}
                {Array.isArray(modeComicsPerCharacter)
                  ? modeComicsPerCharacter.join(", ")
                  : modeComicsPerCharacter}
              </h3>
              <div>
                <button onClick={toggleChart}>Toggle Chart</button>
                {currentChart === "bar" ? (
                  <BarChart width={600} height={300} data={characterData}>
                    <XAxis dataKey="title" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="characters" fill="#8884d8" />
                  </BarChart>
                ) : (
                  <LineChart width={600} height={300} data={characterData}>
                    <XAxis dataKey="title" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="characters"
                      stroke="#82ca9d"
                    />
                  </LineChart>
                )}
              </div>
            </div>

            <div className="filters">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title..."
              />

              <select onChange={(e) => setSelectedCharacter(e.target.value)}>
                <option value="">Select Character</option>
                {comics.flatMap((comic) =>
                  comic.characters.items.map((character) => (
                    <option
                      key={`${character.id}-${comic.id}`}
                      value={character.name}
                    >
                      {character.name}
                    </option>
                  ))
                )}
              </select>

              <select onChange={(e) => setSelectedComicType(e.target.value)}>
                <option value="">Select Comic Type</option>
                <option value="comic">Comic</option>
                <option value="graphic novel">Graphic Novel</option>
                <option value="trade paperback">Trade Paperback</option>
                {/* Add more options as needed */}
              </select>
            </div>

            <ComicsList filteredComics={filteredComics} />
          </>
        )}
      </div>
    </div>
  );
};

export default App;
