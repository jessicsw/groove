import prisma from "../lib/prisma";
import { validateToken } from "../lib/auth";
import { useState } from "react";
import { useRouter } from "next/router";
import { fetchSearchResults } from "../lib/fetcher";
import { IoSearchOutline } from "react-icons/io5";
import { AiFillCaretDown } from "react-icons/ai";
import { addSong } from "../lib/mutations";
import Link from "next/link";

interface JwtPayLoad {
  id: number;
}

const Search = ({ playlists }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [songId, setSongId] = useState(null);
  const router = useRouter();

  const handleOnClick = (e) => {
    setQuery("");
    setResults(null);
  };

  const handleOnChange = (e) => {
    setQuery(e.target.value);
  };

  const handleOnKeyDown = async (e) => {
    if (e.key === "Enter") {
      const json = await fetchSearchResults(query);
      setResults(json);
    } else if (e.key === "Backspace") {
      setResults(null);
    }
  };

  const handleDropDownMenu = (songId) => {
    setIsVisible((state) => !state);
    setSongId(songId);
  };

  const handleAddSong = async (playlistId) => {
    try {
      await addSong({ songId, playlistId });
    } catch (error) {
      console.log("Error with adding song");
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] w-full flex-col items-center  bg-gradient-to-b from-indigo-500 to-black p-5 text-white">
      <div className="min-w-[301px] max-w-[301px] py-5">
        <label className="text-xl font-semibold" htmlFor="search">
          Find songs to add to your playlist
        </label>
        <div className="relative">
          <input
            className="mt-5 block w-full rounded-md bg-black bg-opacity-80 py-3 pl-10 focus:outline-none"
            type="text"
            name="search"
            value={query}
            placeholder="Search"
            onChange={handleOnChange}
            onKeyDown={handleOnKeyDown}
          />
          <IoSearchOutline
            className="absolute bottom-[11px] left-[9px]"
            size={25}
          />
          {query ? (
            <button
              className="absolute right-[14px] bottom-[11px] text-xl font-light"
              type="submit"
              onClick={handleOnClick}
            >
              X
            </button>
          ) : null}
        </div>
      </div>
      <div className="w-full py-5">
        {results?.length === 0 ? (
          <div>No results found for "{query}"</div>
        ) : (
          <table className="w-full">
            <tbody>
              {results?.map((song) => (
                <tr
                  key={song?.id}
                  className=" hover:bg-white hover:bg-opacity-20"
                >
                  <td className="rounded-l" />
                  <td className="flex items-center py-1 pl-4">
                    <img
                      src={song.artist.image}
                      alt="album cover"
                      className="h-10 w-10"
                    />
                    <div className="ml-5 flex flex-col">
                      <div className="whitespace-nowrap leading-6 text-white">
                        {song.name}
                      </div>
                      <div className="whitespace-nowrap text-[13px] text-gray-400">
                        {song.artist.name}
                      </div>
                    </div>
                  </td>
                  <td className="rounded-r pr-5 text-end">
                    <button
                      name="add song"
                      type="button"
                      value={song.id}
                      onClick={() => handleDropDownMenu(song.id)}
                      className="whitespace-nowrap rounded-full border border-white py-1 px-4 text-sm font-semibold "
                    >
                      <div className="flex items-center justify-between">
                        Add to playlist
                        <AiFillCaretDown className="pl-1" size={18} />
                      </div>
                    </button>
                    <div
                      className={`${
                        isVisible ? "block" : "hidden"
                      } absolute right-8 z-10 mt-1 w-56 origin-top-right rounded-md bg-black bg-opacity-80 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="menu-button"
                      tabIndex={-1}
                    >
                      <div
                        className="scroll m-2 h-[200px] overflow-y-scroll"
                        role="none"
                      >
                        {playlists.map((playlist) => (
                          <Link
                            href={`/playlist/${playlist.id}`}
                            className="block px-4 py-2 text-start text-sm text-white text-opacity-60 hover:overflow-y-visible hover:rounded-md hover:bg-white hover:bg-opacity-20"
                            role="menuitem"
                            tabIndex={-1}
                            key={playlist.id}
                            passHref
                            onClick={() => handleAddSong(playlist.id)}
                          >
                            {playlist.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Search;

export async function getServerSideProps({ query, req }) {
  let user;

  try {
    user = validateToken(req.cookies.GROOVE_ACCESS_TOKEN) as JwtPayLoad;
  } catch (error) {
    return {
      redirect: {
        permanent: false,
        destination: "/login",
      },
    };
  }

  const playlists = await prisma.playlist.findMany({
    where: { userId: user.id },
  });

  return {
    props: {
      playlists: JSON.parse(JSON.stringify(playlists)),
    },
  };
}