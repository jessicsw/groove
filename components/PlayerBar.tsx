import Player from "./Player";
import { useStoreState } from "easy-peasy";

const PlayerBar = () => {
  const songs = useStoreState((state: any) => state.activeSongs);
  const activeSong: any = useStoreState((state: any) => state.activeSong);

  return (
    <div className="h-[100px] bg-black opacity-90">
      <div className="flex h-full items-center justify-between p-4 text-white">
        <div className="w-[20%]">
          {activeSong ? (
            <div className="flex items-center">
              <img
                src={`https://picsum.photos/60?random=${activeSong.id}`}
                alt="active song album cover"
              />
              <div className="flex flex-col pl-4">
                <div className="text-[13px]">{activeSong.name}</div>
                <div className="text-[11px] leading-5 text-gray-400">
                  {activeSong.artist.name}
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div className="w-[60%]">
          <Player songs={songs} activeSong={activeSong} />
        </div>
        <div className="w-[20%] text-center">volume/sync</div>
      </div>
    </div>
  );
};

export default PlayerBar;