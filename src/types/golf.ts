// Golf App Type Definitions

export interface Player {
  id: string;
  name: string;
  handicap: number;
  homeClub: string;
  bio?: string;
  avatarUrl?: string;
  joinedDate: string;
  roundsPlayed: number;
}

export type GameFormat = 
  | 'Stroke Play' 
  | 'Stableford' 
  | 'Match Play' 
  | 'Best Ball' 
  | 'Scramble' 
  | 'Skins';

export type HandicapRange = 
  | 'All Levels' 
  | '0-10' 
  | '10-20' 
  | '20-30' 
  | '30+';

export interface GolfRound {
  id: string;
  date: string;
  time: string;
  course: string;
  courseLocation: string;
  format: GameFormat;
  playersNeeded: number;
  currentPlayers: Player[];
  handicapRange: HandicapRange;
  organizer: Player;
  description?: string;
  status: 'open' | 'full' | 'completed' | 'cancelled';
}

export interface GolfCourse {
  id: string;
  name: string;
  location: string;
  holes: 9 | 18;
  par: number;
}

// Form types for creating rounds
export interface CreateRoundForm {
  date: Date;
  time: string;
  courseId: string;
  format: GameFormat;
  playersNeeded: number;
  handicapRange: HandicapRange;
  description?: string;
}
