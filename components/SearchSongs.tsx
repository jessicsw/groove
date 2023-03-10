import { IoSearchOutline } from "react-icons/io5";
import { ChangeEvent, KeyboardEvent, useState } from "react";
import { fetchSearchResults, fetchPlaylistSongs } from "../lib/fetchers";
import { useRouter } from "next/router";
import { addSong } from "../lib/mutations";
import useSWR from "swr";
import Image from "next/image";

type Artist = {
  id: number;
  image: string;
  name: string;
};

type Song = {
  duration: number;
  id: string;
  name: string;
  url: string;
  artistId: number;
  artist: Artist;
  createdAt: Date;
};

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[] | null>(null);
  const router = useRouter();

  const { id: playlistId } = router.query as { id: string };
  const { data: playlistSongs, mutate: mutatePlaylistSongs } = useSWR(
    `/api/song?playlistId=${playlistId}`,
    fetchPlaylistSongs
  );

  const handleOnClick = () => {
    setQuery("");
    setResults(null);
  };

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleOnKeyDown = async (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      const json = await fetchSearchResults(query);
      setResults(json);
    } else if (e.key === "Backspace") {
      setResults(null);
    }
  };

  const handleAddSong = async (newSong: Song) => {
    try {
      await mutatePlaylistSongs([...playlistSongs, newSong], false);
      await addSong({ songId: newSong.id, playlistId });
      router.replace(router.asPath);
    } catch (error) {
      console.error("Error with mutate in SearchSongs");
    }
  };

  return (
    <div>
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
          <div>No results found for &quot;{query}&quot;</div>
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
                    <Image
                      src={song.artist.image}
                      alt="album cover"
                      className="h-10 w-10"
                      width={400}
                      height={400}
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
                      onClick={() => handleAddSong(song)}
                      className="whitespace-nowrap rounded-full border border-white py-1 px-4 text-sm font-semibold hover:px-[17px] hover:py-[5px]"
                    >
                      Add
                    </button>
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
