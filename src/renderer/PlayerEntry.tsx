import React from 'react';
import getFactionImage from './Factions';
import star2 from '../../assets/star2.png';
import getLevelImage from './Levels';
import getFlagImage from './Flags';

declare global {
  interface Window {
    electron: any;
  }
}

interface Props {
  player: any;
}

const PlayerEntry: React.FC<Props> = ({ player }) => {
  const inspectPlayer = () => {
    // eslint-disable-next-line no-constant-condition
    if (!player.ai && false) {
      window.electron.ipcRenderer.inspect(player.relicID);
    }
  };

  return (
    <tr className={player.ai ? '' : 'playerRow'} onClick={inspectPlayer}>
      <td className="factionCol">{getFactionImage(player.faction)}</td>
      <td className="rankCol">
        {player.ai || !player.solo || player.solo.rank === -1 ? (
          <>--</>
        ) : (
          <>
            <div className="levelSection">
              {getLevelImage(player.faction, player.solo.ranklevel.toString())}{' '}
              {player.solo.ranklevel}
            </div>
            <div>{player.solo.rank}</div>
          </>
        )}
      </td>
      <td className="rankCol">
        {player.ai || !player.team || player.team.rank === -1 ? (
          <>--</>
        ) : (
          <>
            <div className="levelSection">
              {getLevelImage(player.faction, player.team.ranklevel.toString())}{' '}
              {player.team.ranklevel}
            </div>
            <div>{player.team.rank}</div>
          </>
        )}
      </td>
      <td className="nameField">
        <div>
          {player.ai || !player.country ? (
            <></>
          ) : (
            <>{getFlagImage(player.country)}</>
          )}{' '}
          {player.name}
        </div>
        <div className="starArea">
          {player.ai || !player.level ? (
            <> </>
          ) : (
            <>
              {player.level > 100 ? (
                <>
                  <img className="starImg" alt="Star" src={star2} />
                </>
              ) : (
                <></>
              )}
              {player.level > 200 ? (
                <>
                  <img className="starImg" alt="Star" src={star2} />
                </>
              ) : (
                <></>
              )}
              {player.level === 300 ? (
                <>
                  <img className="starImg" alt="Star" src={star2} />
                </>
              ) : (
                <></>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default PlayerEntry;

/*         {players.left.map((player: any) => (
          <div key={`${player.relicID} ${player.position}`}>
            {player.faction} {player.name}
          </div>
        ))} */
/*       <div className="teamGroup rightTeam">
        {players.right.map((player: any) => (
          <div key={`${player.relicID} ${player.position}`}>
            {player.faction} {player.name}
          </div>
        ))}
      </div> */

/*               <td className="starCol">
                {player.ai || !player.level ? (
                  <> </>
                ) : (
                  <>
                    {player.level > 100 ? (
                      <>
                        <img className="starImg" alt="Star" src={star2} />
                      </>
                    ) : (
                      <></>
                    )}
                    {player.level > 200 ? (
                      <>
                        <img className="starImg" alt="Star" src={star2} />
                      </>
                    ) : (
                      <></>
                    )}
                    {player.level === 300 ? (
                      <>
                        <img className="starImg" alt="Star" src={star2} />
                      </>
                    ) : (
                      <></>
                    )}
                  </>
                )}
              </td> */
