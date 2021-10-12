import axios from 'axios';

export const createStats = (stats: any) => {
  return {
    wins: stats.wins,
    losses: stats.losses,
    streak: stats.streak,
    disputes: stats.disputes,
    drops: stats.drops,
    rank: stats.rank,
    ranktotal: stats.ranktotal,
    ranklevel: stats.ranklevel,
    regionrank: stats.regionrank,
    regionranktotal: stats.regionranktotal,
    lastmatchdate: stats.lastmatchdate,
  };
};

export const createEmptyStats = () => {
  return {
    wins: 0,
    losses: 0,
    streak: 0,
    disputes: 0,
    drops: 0,
    rank: -1,
    ranktotal: 0,
    ranklevel: 0,
    regionrank: 0,
    regionranktotal: 0,
    lastmatchdate: 0,
  };
};

export const createTeamStats = (stats: any, statgroup: any) => {
  const baseStats = createStats(stats) as any;
  baseStats.members = statgroup.members;
  return baseStats;
};

export const isAxisFaction = (faction: string) => {
  return (
    faction.replace(/\s+/g, '') === 'german' ||
    faction.replace(/\s+/g, '') === 'west_german'
  );
};

export const getPlayerLeaderboardData = async (localData: any) => {
  const fullData = localData;
  fullData.german = [
    createEmptyStats(),
    createEmptyStats(),
    createEmptyStats(),
    createEmptyStats(),
  ];
  fullData.soviet = [
    createEmptyStats(),
    createEmptyStats(),
    createEmptyStats(),
    createEmptyStats(),
  ];
  fullData.west_german = [
    createEmptyStats(),
    createEmptyStats(),
    createEmptyStats(),
    createEmptyStats(),
  ];
  fullData.aef = [
    createEmptyStats(),
    createEmptyStats(),
    createEmptyStats(),
    createEmptyStats(),
  ];
  fullData.british = [
    createEmptyStats(),
    createEmptyStats(),
    createEmptyStats(),
    createEmptyStats(),
  ];
  fullData.axis = [[], [], []];
  fullData.allies = [[], [], []];
  const requestURL = `https://coh2-api.reliclink.com/community/leaderboard/GetPersonalStat?title=coh2&profile_ids=[${localData.relicID}]`;
  try {
    const apiData = (await axios.get(requestURL)) as any;
    const additionalUserData = apiData.data.statGroups[0].members.find(
      (member: any) => member.profile_id === parseInt(fullData.relicID, 10)
    );
    fullData.steam = additionalUserData.name;
    fullData.xp = additionalUserData.xp;
    fullData.level = additionalUserData.level;
    fullData.leaderboardregion_id = additionalUserData.leaderboardregion_id;
    fullData.country = additionalUserData.country;
    if (!fullData.name) {
      fullData.name = additionalUserData.alias;
    }

    apiData.data.leaderboardStats.forEach((lstat: any) => {
      const matchingGroup = apiData.data.statGroups.find(
        (group: any) => group.id === lstat.statgroup_id
      );
      switch (lstat.leaderboard_id) {
        case 4:
          fullData.german[0] = createStats(lstat);
          break;
        case 8:
          fullData.german[1] = createStats(lstat);
          break;
        case 12:
          fullData.german[2] = createStats(lstat);
          break;
        case 16:
          fullData.german[3] = createStats(lstat);
          break;
        case 5:
          fullData.soviet[0] = createStats(lstat);
          break;
        case 9:
          fullData.soviet[1] = createStats(lstat);
          break;
        case 13:
          fullData.soviet[2] = createStats(lstat);
          break;
        case 17:
          fullData.soviet[3] = createStats(lstat);
          break;
        case 6:
          fullData.west_german[0] = createStats(lstat);
          break;
        case 10:
          fullData.west_german[1] = createStats(lstat);
          break;
        case 14:
          fullData.west_german[2] = createStats(lstat);
          break;
        case 18:
          fullData.west_german[3] = createStats(lstat);
          break;
        case 7:
          fullData.aef[0] = createStats(lstat);
          break;
        case 11:
          fullData.aef[1] = createStats(lstat);
          break;
        case 15:
          fullData.aef[2] = createStats(lstat);
          break;
        case 19:
          fullData.aef[3] = createStats(lstat);
          break;
        case 51:
          fullData.british[0] = createStats(lstat);
          break;
        case 52:
          fullData.british[1] = createStats(lstat);
          break;
        case 53:
          fullData.british[2] = createStats(lstat);
          break;
        case 54:
          fullData.british[3] = createStats(lstat);
          break;
        case 20:
          fullData.axis[0].push(createTeamStats(lstat, matchingGroup));
          break;
        case 22:
          fullData.axis[1].push(createTeamStats(lstat, matchingGroup));
          break;
        case 24:
          fullData.axis[2].push(createTeamStats(lstat, matchingGroup));
          break;
        case 21:
          fullData.allies[0].push(createTeamStats(lstat, matchingGroup));
          break;
        case 23:
          fullData.allies[1].push(createTeamStats(lstat, matchingGroup));
          break;
        case 25:
          fullData.allies[2].push(createTeamStats(lstat, matchingGroup));
          break;
        default:
      }
    });
    return fullData;
  } catch (error) {
    // console.log(error);
  }
  return undefined;
};

export const getPlayerMatchData = async (localData: any, team: any) => {
  const fullData = await getPlayerLeaderboardData(localData);
  if (fullData) {
    switch (fullData.faction.replace(/\s+/g, '')) {
      case 'aef':
        fullData.solo = fullData.aef[team.length - 1];
        break;
      case 'british':
        fullData.solo = fullData.british[team.length - 1];
        break;
      case 'german':
        fullData.solo = fullData.german[team.length - 1];
        break;
      case 'soviet':
        fullData.solo = fullData.soviet[team.length - 1];
        break;
      case 'west_german':
        fullData.solo = fullData.west_german[team.length - 1];
        break;
      default:
        fullData.solo = fullData.west_german[team.length - 1];
    }
    if (team.length > 1) {
      let foundTeam = false;
      let teamSize = team.length - 2;
      while (!foundTeam && teamSize >= 0) {
        let groupPool = fullData.allies;
        if (isAxisFaction(fullData.faction)) {
          groupPool = fullData.axis;
        }
        let groupID = 0;
        while (!foundTeam && groupID < groupPool[teamSize].length) {
          let containsAllMembers = true;
          groupPool[teamSize][groupID].members.forEach((member: any) => {
            if (
              !team.find(
                (mate: any) => parseInt(mate.relicID, 10) === member.profile_id
              )
            ) {
              containsAllMembers = false;
            }
          });
          if (containsAllMembers) {
            fullData.team = groupPool[teamSize][groupID];
            foundTeam = true;
          }
          groupID += 1;
        }
        teamSize -= 1;
      }
    }
    return fullData;
  }
  return undefined;
};
