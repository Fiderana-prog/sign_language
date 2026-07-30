// Sign dictionary + gesture pose system for SignVerse.
// Each sign is a sequence of "poses" that the SigningAvatar interpolates through.
// This mirrors the real approach: a library of pre-defined gesture keyframes,
// enchained on a humanoid figure — no on-the-fly AI generation.

export type Expression = 'neutral' | 'smile' | 'surprise' | 'sad' | 'question';

// Arm pose: rotation (deg) of upper arm and forearm groups, plus a hand shape id.
// Angles are relative to the shoulder joint; 0 = arm hanging down.
export interface ArmPose {
  upper: number; // upper-arm rotation
  fore: number; // forearm rotation
  hand: 'open' | 'fist' | 'point' | 'flat' | 'pinch';
}

export interface Pose {
  left: ArmPose;
  right: ArmPose;
  expression: Expression;
}

export interface Sign {
  word: string; // canonical lookup key (lowercase)
  label: string; // display label
  category: SignCategory;
  definition: string;
  example: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  poses: Pose[];
}

export type SignCategory =
'Salutations' |
'Politesse' |
'Famille' |
'Médecine' |
'Urgence' |
'École' |
'Nourriture' |
'Voyage';

export const CATEGORIES: SignCategory[] = [
'Salutations',
'Politesse',
'Famille',
'Médecine',
'Urgence',
'École',
'Nourriture',
'Voyage'];


const rest: ArmPose = { upper: 6, fore: 4, hand: 'open' };

function p(
left: Partial<ArmPose>,
right: Partial<ArmPose>,
expression: Expression = 'neutral')
: Pose {
  return {
    left: { ...rest, ...left },
    right: { ...rest, ...right },
    expression
  };
}

export const SIGNS: Sign[] = [
{
  word: 'bonjour',
  label: 'Bonjour',
  category: 'Salutations',
  definition: 'Salutation utilisée pour dire bonjour à quelqu\'un.',
  example: 'Bonjour, comment allez-vous ?',
  difficulty: 'Débutant',
  poses: [
  p({}, { upper: 120, fore: 40, hand: 'flat' }, 'smile'),
  p({}, { upper: 150, fore: 10, hand: 'flat' }, 'smile'),
  p({}, { upper: 120, fore: 40, hand: 'flat' }, 'smile')]

},
{
  word: 'merci',
  label: 'Merci',
  category: 'Politesse',
  definition: 'Exprimer sa gratitude envers quelqu\'un.',
  example: 'Merci beaucoup pour votre aide.',
  difficulty: 'Débutant',
  poses: [
  p({}, { upper: 100, fore: 70, hand: 'flat' }, 'smile'),
  p({}, { upper: 60, fore: 30, hand: 'flat' }, 'smile')]

},
{
  word: 'au revoir',
  label: 'Au revoir',
  category: 'Salutations',
  definition: 'Salutation pour prendre congé.',
  example: 'Au revoir, à bientôt !',
  difficulty: 'Débutant',
  poses: [
  p({}, { upper: 150, fore: 5, hand: 'open' }, 'smile'),
  p({}, { upper: 150, fore: 30, hand: 'open' }, 'smile'),
  p({}, { upper: 150, fore: 5, hand: 'open' }, 'smile')]

},
{
  word: 'oui',
  label: 'Oui',
  category: 'Politesse',
  definition: 'Réponse affirmative.',
  example: 'Oui, je suis d\'accord.',
  difficulty: 'Débutant',
  poses: [
  p({}, { upper: 90, fore: 80, hand: 'fist' }),
  p({}, { upper: 100, fore: 60, hand: 'fist' })]

},
{
  word: 'non',
  label: 'Non',
  category: 'Politesse',
  definition: 'Réponse négative.',
  example: 'Non, merci.',
  difficulty: 'Débutant',
  poses: [
  p({}, { upper: 95, fore: 70, hand: 'point' }, 'question'),
  p({}, { upper: 95, fore: 40, hand: 'pinch' }, 'question')]

},
{
  word: 'famille',
  label: 'Famille',
  category: 'Famille',
  definition: 'Ensemble des personnes liées par le sang ou l\'affection.',
  example: 'Ma famille est nombreuse.',
  difficulty: 'Intermédiaire',
  poses: [
  p({ upper: 100, fore: 70, hand: 'pinch' }, { upper: 100, fore: 70, hand: 'pinch' }),
  p({ upper: 120, fore: 40, hand: 'open' }, { upper: 120, fore: 40, hand: 'open' })]

},
{
  word: 'maman',
  label: 'Maman',
  category: 'Famille',
  definition: 'La mère, terme affectueux.',
  example: 'Maman prépare le dîner.',
  difficulty: 'Débutant',
  poses: [
  p({}, { upper: 130, fore: 60, hand: 'open' }, 'smile'),
  p({}, { upper: 140, fore: 40, hand: 'open' }, 'smile')]

},
{
  word: 'papa',
  label: 'Papa',
  category: 'Famille',
  definition: 'Le père, terme affectueux.',
  example: 'Papa rentre du travail.',
  difficulty: 'Débutant',
  poses: [
  p({}, { upper: 145, fore: 50, hand: 'open' }, 'smile'),
  p({}, { upper: 150, fore: 30, hand: 'open' }, 'smile')]

},
{
  word: 'eau',
  label: 'Eau',
  category: 'Nourriture',
  definition: 'Liquide essentiel à la vie.',
  example: 'Je voudrais de l\'eau, s\'il vous plaît.',
  difficulty: 'Débutant',
  poses: [
  p({}, { upper: 95, fore: 85, hand: 'point' }),
  p({}, { upper: 105, fore: 70, hand: 'point' })]

},
{
  word: 'manger',
  label: 'Manger',
  category: 'Nourriture',
  definition: 'Consommer de la nourriture.',
  example: 'Je veux manger maintenant.',
  difficulty: 'Débutant',
  poses: [
  p({}, { upper: 100, fore: 90, hand: 'pinch' }),
  p({}, { upper: 80, fore: 70, hand: 'pinch' })]

},
{
  word: 'médecin',
  label: 'Médecin',
  category: 'Médecine',
  definition: 'Professionnel de santé qui soigne les malades.',
  example: 'Appelez un médecin !',
  difficulty: 'Intermédiaire',
  poses: [
  p({}, { upper: 90, fore: 90, hand: 'pinch' }, 'question'),
  p({}, { upper: 110, fore: 60, hand: 'pinch' }, 'question')]

},
{
  word: 'malade',
  label: 'Malade',
  category: 'Médecine',
  definition: 'Qui souffre d\'une maladie.',
  example: 'Je me sens malade.',
  difficulty: 'Intermédiaire',
  poses: [
  p({ upper: 120, fore: 70, hand: 'flat' }, { upper: 120, fore: 70, hand: 'flat' }, 'sad'),
  p({ upper: 130, fore: 50, hand: 'flat' }, { upper: 130, fore: 50, hand: 'flat' }, 'sad')]

},
{
  word: 'aide',
  label: 'Aide',
  category: 'Urgence',
  definition: 'Soutien apporté à quelqu\'un.',
  example: 'J\'ai besoin d\'aide !',
  difficulty: 'Débutant',
  poses: [
  p({ upper: 90, fore: 80, hand: 'flat' }, { upper: 90, fore: 40, hand: 'fist' }, 'surprise'),
  p({ upper: 110, fore: 60, hand: 'flat' }, { upper: 110, fore: 20, hand: 'fist' }, 'surprise')]

},
{
  word: 'urgence',
  label: 'Urgence',
  category: 'Urgence',
  definition: 'Situation qui nécessite une action immédiate.',
  example: 'C\'est une urgence !',
  difficulty: 'Avancé',
  poses: [
  p({ upper: 150, fore: 20, hand: 'open' }, { upper: 150, fore: 20, hand: 'open' }, 'surprise'),
  p({ upper: 120, fore: 60, hand: 'fist' }, { upper: 120, fore: 60, hand: 'fist' }, 'surprise')]

},
{
  word: 'école',
  label: 'École',
  category: 'École',
  definition: 'Établissement où l\'on enseigne.',
  example: 'Je vais à l\'école.',
  difficulty: 'Débutant',
  poses: [
  p({ upper: 90, fore: 80, hand: 'flat' }, { upper: 90, fore: 80, hand: 'flat' }),
  p({ upper: 90, fore: 60, hand: 'flat' }, { upper: 90, fore: 60, hand: 'flat' })]

},
{
  word: 'apprendre',
  label: 'Apprendre',
  category: 'École',
  definition: 'Acquérir des connaissances.',
  example: 'J\'aime apprendre la langue des signes.',
  difficulty: 'Intermédiaire',
  poses: [
  p({}, { upper: 100, fore: 90, hand: 'pinch' }, 'smile'),
  p({}, { upper: 120, fore: 50, hand: 'fist' }, 'smile')]

},
{
  word: 'pharmacie',
  label: 'Pharmacie',
  category: 'Voyage',
  definition: 'Lieu où l\'on achète des médicaments.',
  example: 'Où est la pharmacie ?',
  difficulty: 'Avancé',
  poses: [
  p({}, { upper: 95, fore: 85, hand: 'flat' }, 'question'),
  p({}, { upper: 95, fore: 60, hand: 'point' }, 'question')]

},
{
  word: 'où',
  label: 'Où',
  category: 'Voyage',
  definition: 'Interrogation sur un lieu.',
  example: 'Où allez-vous ?',
  difficulty: 'Débutant',
  poses: [
  p({}, { upper: 95, fore: 80, hand: 'point' }, 'question'),
  p({}, { upper: 95, fore: 80, hand: 'point' }, 'question')]

},
{
  word: 'comment',
  label: 'Comment',
  category: 'Salutations',
  definition: 'Interrogation sur la manière.',
  example: 'Comment allez-vous ?',
  difficulty: 'Débutant',
  poses: [
  p({ upper: 90, fore: 70, hand: 'open' }, { upper: 90, fore: 70, hand: 'open' }, 'question'),
  p({ upper: 90, fore: 50, hand: 'open' }, { upper: 90, fore: 50, hand: 'open' }, 'question')]

},
{
  word: 'bien',
  label: 'Bien',
  category: 'Politesse',
  definition: 'De manière satisfaisante.',
  example: 'Je vais bien, merci.',
  difficulty: 'Débutant',
  poses: [
  p({}, { upper: 90, fore: 80, hand: 'flat' }, 'smile'),
  p({}, { upper: 100, fore: 40, hand: 'flat' }, 'smile')]

}];


// Neutral / rest pose, used between signs and when idle.
export const REST_POSE: Pose = p({}, {}, 'neutral');

// A generic "fingerspelling" placeholder sequence for unknown words.
export const UNKNOWN_POSES: Pose[] = [
p({}, { upper: 95, fore: 85, hand: 'point' }),
p({}, { upper: 95, fore: 85, hand: 'fist' }),
p({}, { upper: 95, fore: 85, hand: 'open' })];


export function findSign(word: string): Sign | undefined {
  const clean = word.toLowerCase().replace(/[.,!?;:]/g, '').trim();
  return SIGNS.find((s) => s.word === clean);
}

export interface GlossToken {
  word: string;
  sign?: Sign;
  known: boolean;
}

// Very simple "text-to-gloss": splits a phrase into lookup tokens.
// Real LSF grammar is not word-for-word — this is a pragmatic prototype.
export function textToGloss(text: string): GlossToken[] {
  const tokens: GlossToken[] = [];
  // Handle a couple of two-word signs first.
  const normalized = text.toLowerCase().replace(/au revoir/g, 'au_revoir');
  const words = normalized.split(/\s+/).filter(Boolean);
  for (const raw of words) {
    const word = raw.replace(/_/g, ' ');
    const sign = findSign(word);
    tokens.push({ word: word.replace(/[.,!?;:]/g, ''), sign, known: !!sign });
  }
  return tokens;
}

// Flatten a gloss sequence into a continuous list of poses for the avatar.
export function glossToPoses(tokens: GlossToken[]): Pose[] {
  const poses: Pose[] = [REST_POSE];
  for (const t of tokens) {
    const src = t.sign ? t.sign.poses : UNKNOWN_POSES;
    poses.push(...src);
    poses.push(REST_POSE);
  }
  return poses;
}