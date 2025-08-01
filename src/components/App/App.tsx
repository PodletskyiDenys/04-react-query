import MovieGrid from "../MovieGrid/MovieGrid";
import SearchBar from "../SearchBar/SearchBar";
import type { Movie } from "../../types/movie";
import { fetchMovies } from "../../services/movieService";
import { useState, useEffect } from "react";
import css from "./App.module.css";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import MovieModal from "../MovieModal/MovieModal";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import ReactPaginate from "react-paginate";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

export default function App() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["movies", query, page],
    queryFn: () => fetchMovies(query, page),
    enabled: query !== "",
    placeholderData: keepPreviousData,
  });

  const totalPages = data?.total_pages ?? 0;

  useEffect(() => {
    if (query !== "" && data?.results.length === 0) {
      toast("No movies found for your request.", {
        duration: 2000,
        position: "top-center",
      });
    }
  }, [isSuccess, data, query]);

  const handleFormSubmit = (newQuery: string) => {
    setQuery(newQuery.trim());
    setPage(1);
    setSelectedMovie(null);
  };

  const handleSelectedMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMovie(null);
    setIsModalOpen(false);
  };

  return (
    <div className={css.app}>
      <SearchBar onSubmit={handleFormSubmit} />

      {query !== "" && (
        <>
          {isLoading && <Loader />}
          {isError && <ErrorMessage />}

          {isSuccess && data?.results.length > 0 && (
            <>
              <ReactPaginate
                pageCount={totalPages}
                pageRangeDisplayed={5}
                marginPagesDisplayed={1}
                onPageChange={({ selected }) => setPage(selected + 1)}
                forcePage={page - 1}
                containerClassName={css.pagination}
                activeClassName={css.active}
                nextLabel="→"
                previousLabel="←"
              />

              <MovieGrid onSelect={handleSelectedMovie} movies={data.results} />

              {isModalOpen && selectedMovie && (
                <MovieModal movie={selectedMovie} onClose={closeModal} />
              )}
            </>
          )}

          <Toaster />
        </>
      )}
    </div>
  );
}
