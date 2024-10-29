import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import md5 from "crypto-js/md5";

const ComicDetail = () => {
  const { id } = useParams();
  const [comic, setComic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComic = async () => {
      const API_KEY = import.meta.env.VITE_APP_API_KEY;
      const PRIVATE_API_KEY = import.meta.env.VITE_SERVER_API_KEY;
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const hash = md5(timestamp + PRIVATE_API_KEY + API_KEY).toString();
      const url = `https://gateway.marvel.com:443/v1/public/comics/${id}?apikey=${API_KEY}&ts=${timestamp}&hash=${hash}`;

      console.log("Fetch URL:", url); // Log the URL for debugging

      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.code === 200) {
          setComic(data.data.results[0]);
        } else {
          setComic(null); // Clear comic state
          setError(data.status); // Set error state
          console.error("Error fetching comic details:", data.status);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError("Failed to fetch comic details.");
      } finally {
        setLoading(false);
      }
    };

    fetchComic();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{`Error: ${error}`}</p>;

  return (
    <div>
      <h2>{comic.title}</h2>
      <img
        src={`${comic.thumbnail.path}.${comic.thumbnail.extension}`}
        alt={comic.title}
      />
      <p>{comic.description || "No description available."}</p>
      <h3>Details</h3>
      <p>
        <strong>Issue Number:</strong> {comic.issueNumber}
      </p>
      <p>
        <strong>Page Count:</strong> {comic.pageCount}
      </p>
      <p>
        <strong>Price:</strong>{" "}
        {comic.prices.length > 0 ? comic.prices[0].price : "N/A"}
      </p>
      {/* Add more fields as needed */}
    </div>
  );
};

export default ComicDetail;
