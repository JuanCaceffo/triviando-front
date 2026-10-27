export type LetterType = 'A' | 'B' | 'C' | 'D';
type DifficultyType = 'LOW' | 'MEDIUM' | 'HIGH';

interface IOptionDTO {
  id: number;
  letter: LetterType;
  text: string;
}

interface IOption {
  id: number;
  letter: LetterType;
  text: string;
}

export interface IQuizDTO {
  id: number;
  topico: string;
  enunciado: string;
  options: IOptionDTO[];
  explicacion: string;
  difficulty: DifficultyType;
}

export interface IQuiz {
  id: number;
  question: string;
  options: IOption[];
  explanation: string;
  difficulty: DifficultyType;
}

export interface QuestionFeedbackProps {
  onFeedbackSubmit: (feedbackType: string, description?: string) => void;
  disabled?: boolean;
  resetKey?: number | string; // Nuevo prop para resetear el estado
}

export interface IFeedbackDTO {
  questionId: number;
  feedbackType: string;
  description?: string;
}
