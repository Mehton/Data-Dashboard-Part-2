import React from "react";
import { Link } from "react-router-dom";

const ComicsList = ({ filteredComics }) => {
  return (
    <div className="comics-list">
      {filteredComics.map((comic) => (
        <Link
          to={`/ComicDetail/${comic.id}`}
          key={comic.id}
          className="comic-card"
        >
          <h3>{comic.title}</h3>
          <img
            src={`${comic.thumbnail.path}.${comic.thumbnail.extension}`}
            alt={comic.title}
            className="comic-image"
          />
        </Link>
      ))}
    </div>
  );
};

export default ComicsList;
